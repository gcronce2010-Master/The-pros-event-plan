'use client';

/**
 * @fileOverview Barrel file for Firebase functionality.
 * Exports hooks and initialization logic for use throughout the application.
 */

export * from './init';
export * from './provider';
export * from './memo';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './error-listener';
