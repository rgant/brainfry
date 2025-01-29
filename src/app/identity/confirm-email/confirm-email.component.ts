/**
 * Sends the user an email to confirm access to the email address.
 */
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { Auth, user as getUser$, sendEmailVerification } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import type { Observable } from 'rxjs';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';

type VerifyStatuses = 'sending' | 'sent' | 'unsent';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ AsyncPipe, AuthErrorMessagesComponent, SpinnerComponent ],
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
})
export class ConfirmEmailComponent {
  public readonly $errorCode: WritableSignal<string>;
  public readonly $verificationStatus: WritableSignal<VerifyStatuses>;
  public readonly user$: Observable<User | null>;

  private readonly _auth: Auth;

  constructor() {
    this._auth = inject(Auth);

    this.$errorCode = signal<string>('');
    this.$verificationStatus = signal<VerifyStatuses>('unsent');

    // Not handling non-logged in users because the Route guards should.
    this.user$ = getUser$(this._auth);
  }

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
