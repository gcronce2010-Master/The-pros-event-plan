'use client';

/**
 * @fileOverview Barrel file for Firebase functionality.
 * Exports hooks and initialization logic for use throughout the application.
 * Uses explicit exports to prevent circular dependency issues and improve Turbopack resolution.
 */

export { initializeFirebase } from './init';
export type { FirebaseServices } from './init';
export {
  FirebaseProvider,
  useFirebase,
  useAuth,
  useFirestore,
  useFirebaseApp,
  useUser,
} from './provider';
export { useMemoFirebase, isFirebaseMemoized } from './memo';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export {
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from './non-blocking-updates';
export {
  initiateAnonymousSignIn,
  initiateEmailSignUp,
  initiateEmailSignIn,
} from './non-blocking-login';
export { FirestorePermissionError } from './errors';
export { errorEmitter } from './error-emitter';
export { FirebaseErrorListener } from './error-listener';
