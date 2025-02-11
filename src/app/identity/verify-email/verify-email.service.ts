import { inject, Injectable } from '@angular/core';
import { applyActionCode, Auth } from '@angular/fire/auth';

import { getErrorCode } from '../error-code';

/**
 * Results of verifying an email address with Firebase.
 */
export interface VerifyEmailResult {
  /** Destination after verifying email. */
  readonly continueUrl: string;
  /** Error that prevented verification, if verfied is false. */
  readonly errorCode?: string;
  /** Was the email verified successfully. */
  readonly verified: boolean;
}

/**
 * Wrapper for verifying an email with Firebase. This is mostly just to make unit testing easier.
 */
@Injectable({ providedIn: 'root' })
export class VerifyEmailService {
  private readonly _auth: Auth = inject(Auth);

  /**
   * Apply the oobCode to verify the user account's email address.
   * Catches errors and wraps in the results interface for use in the template.
   */
  public async verifyEmail(oobCode: string | undefined, continueUrl: string = '/'): Promise<VerifyEmailResult> {
    if (oobCode) {
      try {
        await applyActionCode(this._auth, oobCode);
        return { continueUrl, verified: true };
      } catch (err: unknown) {
        const errorCode = getErrorCode(err);
        return { continueUrl, errorCode, verified: false };
      }
    }

    return { continueUrl, errorCode: 'oobCode not found', verified: false };
  }
}
