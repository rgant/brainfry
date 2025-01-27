/**
 * Marks the user's email as verified.
 */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { getState } from '../actions/get-state';
import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { VerifyEmailService } from './verify-email.service';
import type { VerifyEmailResult } from './verify-email.service';

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
  public readonly vm: Promise<VerifyEmailResult>;

  private readonly _router: Router;
  private readonly _service: VerifyEmailService;

  constructor() {
    this._router = inject(Router);
    this._service = inject(VerifyEmailService);

    const { continueUrl, oobCode } = getState(this._router.getCurrentNavigation());
    this.vm = this._service.verifyEmail(oobCode, continueUrl);
  }
}
