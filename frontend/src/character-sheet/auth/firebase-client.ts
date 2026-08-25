import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
};

let authPromise: Promise<Auth> | null = null;

export function getFirebaseAuth(): Promise<Auth> {
  if (authPromise !== null) return authPromise;

  authPromise = (async () => {
    for (const [key, value] of Object.entries(firebaseConfig)) {
      if (value === undefined || value.trim() === "") {
        throw new Error(`Missing Firebase configuration: ${key}`);
      }
    }

    const app =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    return auth;
  })().catch((error) => {
    authPromise = null;
    throw error;
  });

  return authPromise;
}
