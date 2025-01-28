import { inject, Injectable } from '@angular/core';
import { applyActionCode, Auth } from '@angular/fire/auth';

import { getErrorCode } from '../error-code';

export interface VerifyEmailResult {
  continueUrl: string;
  errorCode?: string;
  verified: boolean;
}

@Injectable({ providedIn: 'root' })
export class VerifyEmailService {
  private readonly _auth: Auth = inject(Auth);

  /**
   * This is mostly just to make unit testing easier.
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
