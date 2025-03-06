import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SpinnerComponent } from '~/app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';
import { createEmailControl } from '../identity-forms';

/** FormGroup allows the use of (ngSubmit) on the Form element. */
type ForgotFormGroup = FormGroup<{ email: FormControl<string | null> }>;

/**
 * Sends email to reset password for a user's account.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    RouterLink,
    SpinnerComponent,
  ],
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  /** Errors specific to the email field. */
  public readonly $emailCntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for the email field. */
  public readonly $emailCntrlInvalid: Signal<boolean>;
  /** Form submission errors from Firebase Authentication response. */
  public readonly $errorCode: WritableSignal<string>;
  /** Toggle the HTML form and spinner. */
  public readonly $showForm: WritableSignal<boolean>;
  public readonly emailCntrl: FormControl<string | null>;
  public readonly forgotForm: ForgotFormGroup;

  private readonly _auth: Auth;

  constructor() {
    this._auth = inject(Auth);

    ({ $errors: this.$emailCntrlErrors, $invalid: this.$emailCntrlInvalid, control: this.emailCntrl } = createEmailControl());

    this.forgotForm = new FormGroup({ email: this.emailCntrl });

    this.$errorCode = signal<string>('');
    this.$showForm = signal<boolean>(true);
  }

  /**
   * Sends password reset email to submitted email address, if it exists in Firebase Authentication.
   *
   * Email enumeration protection is enabled in production, so errors should not indicate if an
   * account exists with the submitted email address.
   */
  public async onSubmit(): Promise<void> {
    const { email } = this.forgotForm.value;

    // Validators prevent email being falsy, but TypeScript doesn't know that.
    if (this.forgotForm.invalid || !email) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
    this.$errorCode.set(''); // Clear out any existing errors

    try {
      await sendPasswordResetEmail(this._auth, email);
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
    }

    this.$showForm.set(true);
  }
}
