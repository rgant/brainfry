import { inject, Injectable } from '@angular/core';
import { Auth, confirmPasswordReset, verifyPasswordResetCode } from '@angular/fire/auth';
import {
  from,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import type { Observable } from 'rxjs';

import { getErrorCode } from '../error-code';

/** Combined results of all possible password verfication and confirmation paths. */
export type ResetPasswordResults = PasswordResetSuccess | ShowForm | VerifiedFailed | undefined;

/** Combined end results of password confirmation */
type ConfirmResult = PasswordResetSuccess | ShowForm;

/** Final state after resetting password. */
interface PasswordResetSuccess {
  /** This makes the template type checker happy. */
  readonly errorCode: undefined;
  /** On success hide the form and show the success message. */
  readonly showForm: false;
}

/** Verified success & password reset failure. */
interface ShowForm {
  /** User email address to reset password for, from Firebase oobCode. */
  readonly email: string;
  /** Firebase response error code, if any. */
  readonly errorCode?: string;
  /** Display the reset password form to collect and confirm the new password. */
  readonly showForm: true;
}

/** Code verification failed. */
interface VerifiedFailed {
  /** This makes the type checker happy during destructuring. */
  readonly email: undefined;
  /** Firebase response error code. */
  readonly errorCode: string;
  /** On Firebase error hide the form and show the error message. */
  readonly showForm: false;
}

/** Combined end results of possword verification. */
type VerifiedResult = ShowForm | VerifiedFailed;

/**
 * Handles both password reset oobCode verification, and password reset confirmation.
 */
@Injectable({ providedIn: 'root' })
export class ResetPasswordService {
  private readonly _auth: Auth = inject(Auth);
  private readonly _newPasswordSubject$: Subject<string> = new Subject<string>();

  /**
   * Triggers the confirmPasswordReset promise to apply the action code and replace the user's password.
   */
  public replacePassword(newPassword: string): void {
    this._newPasswordSubject$.next(newPassword);
  }

  /**
   * Sets up an Observable that will first verify the oobCode is valid for password resetting, and
   * then show the password reset form and the user's email address.
   * This is followed by setting up a subject to emit a new password that will then be confirmed as
   * the new password for the user. While that action is pending it emits `undefined` to show the
   * spinner again. In the event of an error it shows the form again with an error message.
   */
  public resetPassword$(code: string | undefined): Observable<ResetPasswordResults> {
    return of(code).pipe(
      switchMap(async (oobCode: string | undefined): Promise<VerifiedResult> => this._verifyCode(oobCode)),
      switchMap((verifyResults: VerifiedResult): Observable<ResetPasswordResults> => {
        const verifyResults$ = of(verifyResults);
        const { email } = verifyResults;

        // Verified succeeded
        if (email) {
          // This design with an inner `merge` after `_verifyCode` settles is to accomodate passing
          // the email to _confirmPasswordReset in case the new password is rejected.
          // However, it does make testing this path more complicated I think. Would it be better to
          // move the merge to the return of resetPassword$ and store the email as a private property?
          const confirmPasswordReset$ = this._newPasswordSubject$.pipe(
            switchMap((newPassword: string): Observable<ConfirmResult | undefined> => {
              const promise = this._confirmPasswordReset(code, email, newPassword);
              return from(promise)
                // Show the spinner while applying the action code.
                .pipe(startWith(undefined));
            }),
          );

          return merge(
            // This will emit first after code verification.
            verifyResults$,
            // This will emit after form submission.
            confirmPasswordReset$,
          );
        }

        // Verified failed
        return verifyResults$;
      }),
    );
  }

  /**
   * Applies the new password to the user's account using the oobCode.
   * @param email - Is necessary only in the case that `confirmPasswordReset` fails, and we need to
   *              redisplay the form.
   * @throws If the oobCode is falsy
   */
  private async _confirmPasswordReset(code: string | undefined, email: string, newPassword: string): Promise<ConfirmResult> {
    if (code) {
      try {
        await confirmPasswordReset(this._auth, code, newPassword);
        return { errorCode: undefined, showForm: false };
      } catch (err: unknown) {
        return { email, errorCode: getErrorCode(err), showForm: true };
      }
    }
    throw new Error('oobCode not found');
  }

  /**
   * This identifies the email for the User who's password would be reset by the oobCode.
   */
  private async _verifyCode(code: string | undefined): Promise<VerifiedResult> {
    if (code) {
      try {
        const email = await verifyPasswordResetCode(this._auth, code);
        return { email, showForm: true };
      } catch (err: unknown) {
        return { email: undefined, errorCode: getErrorCode(err), showForm: false };
      }
    }

    return { email: undefined, errorCode: 'oobCode not found', showForm: false };
  }
}
