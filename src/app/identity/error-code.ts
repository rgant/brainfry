import { FirebaseError } from '@angular/fire/app';

/**
 * TypeScript/linters want caught errors to be of type unknown. So this function handles checking
 * for FirebaseError and extracting the code, or the message from plain Errors.
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
