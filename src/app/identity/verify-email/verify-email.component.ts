import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SpinnerComponent } from '~/app/shared/spinner/spinner.component';

import { getState } from '../actions/get-state';
import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { VerifyEmailService } from './verify-email.service';
import type { VerifyEmailResult } from './verify-email.service';

/**
 * Marks the user's email as verified.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    SpinnerComponent,
    RouterLink,
  ],
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent {
  /**
   * Observable wrapper around the template that performs the actual verification and displays the
   * results of the verification.
   */
  public readonly vm: Promise<VerifyEmailResult>;

  private readonly _router: Router;
  private readonly _service: VerifyEmailService;

  /**
   * Gets the current navigation statically to obtain the oobCode from Firebase needed to verify the
   * email address of the User.
   */
  constructor() {
    this._router = inject(Router);
    this._service = inject(VerifyEmailService);

    const { continueUrl, oobCode } = getState(this._router.getCurrentNavigation());
    this.vm = this._service.verifyEmail(oobCode, continueUrl);
  }
}
