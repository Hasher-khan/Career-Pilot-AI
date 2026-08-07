/**
 * firestoreService.js
 * ──────────────────────────────────────────────────────────
 * All Firestore read/write operations for CareerPilot AI.
 * - Each Firestore call has a 4-second timeout before falling
 *   back to localStorage so the UI never hangs.
 * - New users get a clean blank profile (name + email only).
 * - Data is always scoped to the user's Firebase UID.
 */

import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

// ─── Timeout helper ──────────────────────────────────────────────────────────
// Races a promise against a timeout. If the timeout wins, falls back gracefully.
function withTimeout(promise, ms = 4000) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Firestore timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timer]);
}

// ─── User Profile ─────────────────────────────────────────────────────────────

/**
 * Save user profile to Firestore (primary) + localStorage (cache/fallback).
 * Always saves to localStorage first so data is never lost.
 */
export async function saveUserProfile(uid, data) {
  const clean = JSON.parse(JSON.stringify(data));

  // 1. Always save to localStorage as immediate cache (including avatarPhoto)
  try {
    localStorage.setItem(`careerpilot_profile_${uid}`, JSON.stringify(clean));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // 2. Save to Firestore — strip avatarPhoto because base64 images can exceed
  //    Firestore's 1 MB document limit, causing silent save failures that break
  //    cross-device sync. The photo is already cached in localStorage above.
  if (!isFirebaseConfigured) return;

  try {
    // eslint-disable-next-line no-unused-vars
    const { avatarPhoto, ...firestoreData } = clean;
    const ref = doc(db, 'users', uid);
    await withTimeout(
      setDoc(ref, { ...firestoreData, updatedAt: serverTimestamp() }, { merge: true }),
      6000  // increase to 6 s for slow mobile connections
    );
  } catch (err) {
    // Silently fall back — data is already in localStorage
    console.warn('Firestore save (using localStorage fallback):', err?.message);
    // Re-throw so callers can show a "sync failed" warning if desired
    throw err;
  }
}

/**
 * Load user profile — tries Firestore first, falls back to localStorage.
 * Returns null if the user has no profile yet.
 */
export async function loadUserProfile(uid) {
  // 1. Try Firestore (with timeout)
  if (isFirebaseConfigured) {
    try {
      const ref  = doc(db, 'users', uid);
      const snap = await withTimeout(getDoc(ref), 6000);

      if (snap.exists()) {
        const firestoreData = snap.data();

        // Merge with localStorage to restore the avatarPhoto (never stored in
        // Firestore — it's too large). This way the photo persists per-device.
        let mergedData = firestoreData;
        try {
          const local = localStorage.getItem(`careerpilot_profile_${uid}`);
          if (local) {
            const localData = JSON.parse(local);
            mergedData = {
              ...firestoreData,
              // Keep local avatarPhoto if Firestore doesn't have one
              avatarPhoto: firestoreData.avatarPhoto || localData.avatarPhoto || null,
            };
          }
        } catch (e) { /* ignore localStorage read errors */ }

        // Keep localStorage in sync with latest Firestore data
        localStorage.setItem(`careerpilot_profile_${uid}`, JSON.stringify(mergedData));
        return mergedData;
      }
    } catch (err) {
      console.warn('Firestore load (falling back to localStorage):', err?.message);
    }
  }

  // 2. Fallback: localStorage cache
  try {
    const local = localStorage.getItem(`careerpilot_profile_${uid}`);
    if (local) return JSON.parse(local);
  } catch (e) {}

  return null;
}

/**
 * Initialize a brand-new user document.
 * Only runs once (when no existing profile is found).
 * New users start with a completely blank profile — just their name & email.
 */
export async function initNewUserProfile(uid, { name, email }) {
  // Check for an existing profile first (Firestore or localStorage)
  const existing = await loadUserProfile(uid);
  if (existing) return; // Already initialized — do nothing

  // Blank starting profile for new users
  const blankProfile = {
    name:            name  || '',
    email:           email || '',
    title:           '',
    phone:           '',
    location:        '',
    targetRole:      '',
    targetIndustry:  '',
    experienceLevel: '',
    summary:         '',
    skills:          [],
    experience:      [],
    education:       [],
    projects:        [],
    certifications:  [],
    currentAtsScore: 0,
    readinessIndex:  0,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  };

  await saveUserProfile(uid, blankProfile);
}

// ─── Generated Items (Cover Letters, Emails, Resume Versions) ─────────────────

export async function saveGeneratedItem(uid, type, data) {
  const clean   = JSON.parse(JSON.stringify(data));
  const newItem = { id: 'item_' + Date.now(), ...clean, createdAt: new Date().toISOString() };

  // Always save to localStorage first
  try {
    const key      = `careerpilot_gen_${uid}_${type}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(newItem);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50))); // keep last 50
  } catch (e) {}

  if (!isFirebaseConfigured) return newItem.id;

  try {
    const colRef = collection(db, 'users', uid, 'generated', type, 'items');
    const docRef = await withTimeout(
      addDoc(colRef, { ...clean, createdAt: serverTimestamp() })
    );
    return docRef.id;
  } catch (err) {
    console.warn('Firestore saveGeneratedItem (localStorage fallback):', err?.message);
    return newItem.id;
  }
}

export async function loadGeneratedItems(uid, type) {
  if (isFirebaseConfigured) {
    try {
      const colRef = collection(db, 'users', uid, 'generated', type, 'items');
      const q      = query(colRef, orderBy('createdAt', 'desc'));
      const snap   = await withTimeout(getDocs(q));

      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Firestore loadGeneratedItems (localStorage fallback):', err?.message);
    }
  }

  // Fallback: localStorage cache
  try {
    const key   = `careerpilot_gen_${uid}_${type}`;
    const local = localStorage.getItem(key);
    if (local) return JSON.parse(local);
  } catch (e) {}

  return [];
}

// ─── Delete User Data ─────────────────────────────────────────────────────────

/**
 * Delete all user data from Firestore and localStorage.
 * Called when user chooses to delete their account.
 */
export async function deleteUserData(uid) {
  // 1. Clear all localStorage data for this user
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(uid)) {
        keysToRemove.push(key);
      }
    }
    // Also clear any careerpilot-specific keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('careerpilot_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
  }

  // 2. Delete user document from Firestore
  if (!isFirebaseConfigured) return;

  try {
    const { deleteDoc } = await import('firebase/firestore');
    const ref = doc(db, 'users', uid);
    await withTimeout(deleteDoc(ref), 6000);
  } catch (err) {
    console.warn('Firestore user doc deletion failed:', err?.message);
    // Non-fatal — the auth account will still be deleted
  }
}
