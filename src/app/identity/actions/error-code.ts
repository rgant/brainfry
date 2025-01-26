import { FirebaseError } from '@angular/fire/app';

/**
 * TypeScript/linters want caught errors to be of type unknown. So this function handles checking
 * for FirebaseError and extracting the code, or the message from plain Errors.
 *
 * Possible error codes from applyActionCode:
 * - auth/expired-action-code
 * - auth/invalid-action-code
 * - auth/user-disabled
 * - auth/user-not-found

 * Possible error codes from sendResetEmail:
 * - auth/invalid-email
 * - auth/missing-continue-uri
 * - auth/invalid-continue-uri
 * - auth/unauthorized-continue-uri
 * - auth/user-not-found
 */
export const getErrorCode = (err: unknown): string => {
  if (err instanceof FirebaseError) {
    return err.code;
  }
  if (err instanceof Error) {
    return err.message;
  }

  console.error('Unknown Error', err);
  return 'unknown';
};

