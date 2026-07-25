import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAv0Q1RhWh6wNu6qBjaeXrs52nlsgUJFKQ';

export const isFirebaseConfigured = Boolean(
  apiKey &&
  apiKey !== 'your-api-key-here' &&
  !apiKey.startsWith('your-') &&
  apiKey !== 'dummy-api-key'
);

const firebaseConfig = {
  apiKey:            apiKey,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'careerpilot-ai-2a00f.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || 'careerpilot-ai-2a00f',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'careerpilot-ai-2a00f.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '512384699987',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || '1:512384699987:web:1d46ca335764bf3a0700a6',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
