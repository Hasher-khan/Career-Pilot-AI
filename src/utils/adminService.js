/**
 * adminService.js
 * ──────────────────────────────────────────────────────────
 * Firestore real-time synchronization for the Admin Panel.
 * Listens to all user profiles in the `users` collection.
 * Also manages the `announcements` collection for broadcasts.
 */

import {
  collection, onSnapshot, query, orderBy,
  addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

/**
 * Subscribe to ALL user profiles from Firestore in real-time.
 * Calls onUpdate with the array of users whenever changes occur.
 */
export function subscribeToAllUsers(onUpdate, onError) {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured — cannot load users for admin.');
    onUpdate([]);
    return () => {};
  }

  try {
    const colRef = collection(db, 'users');
    const q = query(colRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(
      q,
      (snap) => {
        const users = snap.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
        onUpdate(users);
      },
      (err) => {
        console.error('Admin real-time sync failed:', err?.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to initialize real-time subscription:', err?.message);
    if (onError) onError(err);
    return () => {};
  }
}

// ─── Announcements ────────────────────────────────────────────────────────────

/**
 * Subscribe to active announcements in real-time (newest first).
 * Used by both the Admin Panel and the user Dashboard.
 */
export function subscribeToAnnouncements(onUpdate, onError) {
  if (!isFirebaseConfigured) {
    onUpdate([]);
    return () => {};
  }
  try {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => { console.error('Announcements sync failed:', err?.message); if (onError) onError(err); }
    );
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Post a new announcement to Firestore.
 * @param {{ title: string, message: string, type: string, pinned: boolean }} data
 */
export async function postAnnouncement(data) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured.');
  return addDoc(collection(db, 'announcements'), {
    ...data,
    createdAt: serverTimestamp(),
    active: true,
  });
}

/**
 * Delete an announcement by ID.
 */
export async function deleteAnnouncement(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured.');
  return deleteDoc(doc(db, 'announcements', id));
}

/**
 * Toggle active state of an announcement (pin/unpin or disable).
 */
export async function toggleAnnouncement(id, field, value) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured.');
  return updateDoc(doc(db, 'announcements', id), { [field]: value });
}
