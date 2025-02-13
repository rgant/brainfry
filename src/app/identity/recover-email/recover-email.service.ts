import { inject, Injectable } from '@angular/core';
import {
  applyActionCode,
  Auth,
  checkActionCode,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import {
  catchError,
  delayWhen,
  of,
  switchMap,
  timer,
} from 'rxjs';
import type { Observable } from 'rxjs';

import { getErrorCode } from '../error-code';

/** Combined model of email recovery results and sending password reset. */
export interface RecoverEmailResults extends ApplyResult {
  /** Firebase response error code, if any. */
  readonly errorCode?: string;
  /** Indicates if the password reset email was sent on succesful email recovery. */
  readonly passwordResetSent: boolean;
}

/** Results of email recovery. */
interface ApplyResult {
  /** User original email address to be recovered, from Firebase oobCode. */
  readonly restoredEmail?: string;
  /** Results of applying the oobCode to recover the account's original email address. */
  readonly successful: boolean;
}

/** Sending the password reset email needs to wait until Firebase recognizes the email recovery. Milliseconds */
export const SEND_EMAIL_DELAY = 500;

/**
 * Handles both recovering email oobCodes and sending the password reset email afterwards.
 */
@Injectable({ providedIn: 'root' })
export class RecoverEmailService {
  private readonly _auth: Auth = inject(Auth);

  /**
   * Creates and Observable that when subscribed to will apply the action code to restore the user's
   * original email address. And if present will automatically send a password reset email to the
   * restored address in case of account compromise.
   *
   * @param delay - Not for production use! Only for use with testing.
   */
  public recoverEmail$(code: string | undefined, delay: number = SEND_EMAIL_DELAY): Observable<RecoverEmailResults> {
    return of(code).pipe(
      switchMap(async (oobCode: string | undefined): Promise<ApplyResult> => this._doActionCode(oobCode)),
      // Unfortunately it can take time for Firebase to recognize that the email has been restored
      // so we can send the password reset email.
      delayWhen((result: ApplyResult): Observable<number> => timer(result.restoredEmail ? delay : 0)),
      // Give the user the option to reset their password in case the account was compromised:
      switchMap(async (result: ApplyResult): Promise<RecoverEmailResults> => {
        const passwordResetSent = await this._sendPasswordResetEmail(result.restoredEmail);
        return { ...result, passwordResetSent };
      }),
      // Using `err` here trips promise/prefer-await-to-callbacks, but other names don't
      catchError((problem: unknown): Observable<RecoverEmailResults> => {
        console.error('RecoverEmailService', problem);

        return of({
          errorCode: getErrorCode(problem),
          passwordResetSent: false,
          successful: false,
        });
      }),
    );
  }

  /**
   * Check that the oobCode is still valid, and then apply it.
   * @returns the restored email address and a success flag.
   * @throws Error if the oobCode is falsy or the firebase methods fail.
   */
  private async _doActionCode(oobCode: string | undefined): Promise<ApplyResult> {
    if (oobCode) {
      const info = await checkActionCode(this._auth, oobCode);
      const { email: restoredEmail } = info.data;

      await applyActionCode(this._auth, oobCode);
      // Account email reverted to restoredEmail

      // Problem with being pedantic with all types except undefined vs null is that sometimes you
      // need to get rid of null from the type.
      return { restoredEmail: restoredEmail ?? undefined, successful: true };
    }

    throw new Error('oobCode not found');
  }

  /**
   * Firebase types indicate that the email may not always be returned (Accounts without email addresses?)
   * If the email isn't truthy then just skip the reset.
   * If the send email fails for some reason, just return false.
   */
  private async _sendPasswordResetEmail(restoredEmail: string | undefined): Promise<boolean> {
    if (restoredEmail) {
      try {
        await sendPasswordResetEmail(this._auth, restoredEmail);
        return true;
      } catch (err: unknown) {
        console.error('RecoverEmailService#_sendPasswordResetEmail', err);
      }
    }
    return false;
  }
}
