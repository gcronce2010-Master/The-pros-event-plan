'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Results of Firebase initialization.
 */
export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

/**
 * Initializes the Firebase app and its core services.
 */
export function initializeFirebase(): FirebaseServices {
  let app: FirebaseApp;

  if (!getApps().length) {
    try {
      // Attempt automatic initialization (e.g., in App Hosting)
      app = initializeApp();
    } catch (e) {
      // Fallback to manual config
      app = initializeApp(firebaseConfig);
    }
  } else {
    app = getApp();
  }

  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
