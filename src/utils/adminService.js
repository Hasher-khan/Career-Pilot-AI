/**
 * adminService.js
 * ──────────────────────────────────────────────────────────
 * Firestore real-time synchronization for the Admin Panel.
 * Listens to all user profiles in the `users` collection.
 */

import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
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
