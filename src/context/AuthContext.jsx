import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// ─── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading]  = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user || null);
        setAuthLoading(false);
      },
      (error) => {
        console.warn('Firebase auth listener error:', error);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ── Email / Password Sign Up ────────────────────────────────────────────────
  async function signUpWithEmail(email, password, displayName) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    return credential.user;
  }

  // ── Email / Password Sign In ────────────────────────────────────────────────
  async function signInWithEmail(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }

  // ── Google Sign In ──────────────────────────────────────────────────────────
  async function signInWithGoogle() {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential.user;
  }

  // ── Sign Out ────────────────────────────────────────────────────────────────
  async function signOut() {
    if (auth.currentUser) {
      await firebaseSignOut(auth);
    }
    setCurrentUser(null);
  }

  // ── Password Reset ──────────────────────────────────────────────────────────
  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  // ── Friendly Firebase error messages ────────────────────────────────────────
  function getAuthErrorMessage(code, defaultMsg) {
    const messages = {
      'auth/user-not-found':        'No account found with this email. Click Register to create one.',
      'auth/wrong-password':        'Incorrect password. Please check and try again.',
      'auth/invalid-credential':    'Invalid email or password. Please check your credentials.',
      'auth/email-already-in-use':  'An account with this email address already exists.',
      'auth/weak-password':         'Password must be at least 6 characters long.',
      'auth/invalid-email':         'Please enter a valid email address.',
      'auth/too-many-requests':     'Too many failed attempts. Please try again later.',
      'auth/popup-closed-by-user':  'Google sign-in was cancelled.',
      'auth/network-request-failed':'Network connection failed. Please check your internet.',
      'auth/invalid-api-key':       'Firebase API Key is missing or invalid in .env.local.',
      'auth/api-key-not-valid':     'Firebase API Key is missing or invalid in .env.local.',
      'auth/operation-not-allowed': 'This authentication provider is not enabled in Firebase Console.',
      'auth/configuration-not-found':'Firebase Auth is not enabled for this project.',
      'auth/user-disabled':         'This user account has been disabled.'
    };
    return messages[code] || defaultMsg || 'Authentication failed. Please check your credentials.';
  }

  const value = {
    currentUser,
    authLoading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    getAuthErrorMessage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
