/** Operational Ledger design reminder: Firebase remains an invisible, reliable shared ledger behind the precise interface. */
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase Web SDK configuration is public client configuration. Firestore rules and Auth
// providers remain the security boundary; no service-account credential belongs here.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDHA6o05DXBQQyw5a9dg_ru6xTU107BAis",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "action-plan-27.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "action-plan-27",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "action-plan-27.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "356390573553",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:356390573553:web:0399b2aeec447c5cf76050",
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
let app: FirebaseApp | undefined;
export let auth: Auth | undefined;
export let db: Firestore | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
}
