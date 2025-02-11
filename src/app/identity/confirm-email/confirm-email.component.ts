import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { sendEmailVerification } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';

import { USER$ } from '@app/core/user.token';
import type { MaybeUser$ } from '@app/core/user.token';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';
import type { SendVerifyEmailStatuses } from './send-confirm-email';

/**
 * Sends the user an email to confirm access to the email address.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ AsyncPipe, AuthErrorMessagesComponent, SpinnerComponent ],
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
})
export class ConfirmEmailComponent {
  /** Firebase response error code */
  public readonly $errorCode: WritableSignal<string>;
  /** Triggers different stages in the view for email verification sending. */
  public readonly $verificationStatus: WritableSignal<SendVerifyEmailStatuses>;
  /** Currently logged in Firebase User. */
  public readonly user$: MaybeUser$;

  constructor() {
    this.$errorCode = signal<string>('');
    this.$verificationStatus = signal<SendVerifyEmailStatuses>('unsent');

    // Not handling non-logged in users because the Route guards should.
    this.user$ = inject(USER$);
  }

  /**
   * Sends email to User's email address in Firebase Authentication to verify control of the address.
   */
  public async sendConfirmEmail(user: User): Promise<void> {
    this.$errorCode.set(''); // Clear out any existing errors
    this.$verificationStatus.set('sending');

    try {
      await sendEmailVerification(user);
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
    }

    this.$verificationStatus.set('sent');
  }
}
