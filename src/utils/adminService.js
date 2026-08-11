/**
 * adminService.js
 * ──────────────────────────────────────────────────────────
 * Firestore read operations for the Admin Panel.
 * Loads all user profiles from the `users` collection.
 */

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

// ─── Timeout helper ──────────────────────────────────────────────────────────
function withTimeout(promise, ms = 8000) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Firestore timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timer]);
}

/**
 * Load ALL user profiles from Firestore.
 * Returns an array of user objects with their UIDs.
 */
export async function loadAllUsers() {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured — cannot load users for admin.');
    return [];
  }

  try {
    const colRef = collection(db, 'users');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snap = await withTimeout(getDocs(q), 10000);

    if (snap.empty) return [];

    return snap.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error('Admin: Failed to load users:', err?.message);
    throw err;
  }
}
