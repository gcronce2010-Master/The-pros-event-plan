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

let services: FirebaseServices | null = null;

/**
 * Initializes the Firebase app and its core services.
 * Ensures it only runs on the client and is idempotent.
 */
export function initializeFirebase(): FirebaseServices | null {
  if (typeof window === 'undefined') return null;

  if (services) return services;

  let app: FirebaseApp;

  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      app = getApp();
    }
  } else {
    app = getApp();
  }

  services = {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };

  return services;
}
