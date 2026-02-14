'use client';

import { useMemo, DependencyList } from 'react';

/**
 * Internal registry for memoized Firebase objects.
 * We use a WeakSet to avoid memory leaks and to safely track objects
 * without mutating them (since Firebase SDK objects are often frozen).
 */
const firebaseMemoRegistry = new WeakSet<object>();

/**
 * Safely memoizes a Firebase object and tracks it for verification in hooks.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps);
  
  // Only add valid objects to the WeakSet. null/undefined are skipped.
  if (memoized && typeof memoized === 'object') {
    firebaseMemoRegistry.add(memoized as object);
  }
  
  return memoized;
}

/**
 * Internal utility to verify if a Firebase object was memoized.
 */
export function isFirebaseMemoized(obj: any): boolean {
  // If it's not an object (null, undefined, etc.), we consider it "stable" enough for hooks.
  if (!obj || typeof obj !== 'object') return true;
  return firebaseMemoRegistry.has(obj);
}
