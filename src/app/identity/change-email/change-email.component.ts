/* eslint-disable import-x/max-dependencies -- 11 dependencies */
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';

import { USER$ } from '~/app/core/user.token';
import type { MaybeUser$ } from '~/app/core/user.token';
import { SpinnerComponent } from '~/app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import type { SendVerifyEmailStatuses } from '../confirm-email/send-confirm-email';
import { getErrorCode } from '../error-code';
import { createEmailControl, createPasswordControl, PASSWORDS } from '../identity-forms';
import { confirmMatch, confirmMatchFormErrors } from '../validators/confirm-match';

/** Collects the new email with confirmation and the current password. */
type ChangeEmailFormGroup = FormGroup<{
  email1: FormControl<string | null>;
  email2: FormControl<string | null>;
  password: FormControl<string | null>;
}>;

/**
 * Form for user to change their email address with Firebase Authentication. The new email address
 * must be verified by clicking a link and applying an oobCode before it actually updates.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
})
export class ChangeEmailComponent {
  /** Errors specific to the first new email field. */
  public readonly $email1CntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for the first new email field. */
  public readonly $email1CntrlInvalid: Signal<boolean>;
  /** Errors specific to the second new email field. */
  public readonly $email2CntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for the second new email field. */
  public readonly $email2CntrlInvalid: Signal<boolean>;
  /** Firebase response error code. */
  public readonly $errorCode: WritableSignal<string>;
  /** Aria-invalid attribute for the form validation. */
  public readonly $formEmailsInvalid: Signal<boolean>;
  /** Errors specific to the current password field. */
  public readonly $passwordCntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for the current password field. */
  public readonly $passwordCntrlInvalid: Signal<boolean>;
  /** Cycles through the process of sending a verification email to set the new email address for the User. */
  public readonly $verificationStatus: WritableSignal<SendVerifyEmailStatuses>;
  public readonly changeEmailForm: ChangeEmailFormGroup;
  public readonly email1Cntrl: FormControl<string | null>;
  public readonly email2Cntrl: FormControl<string | null>;
  /** Used in error message for password maximum length. */
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  /** Used in error message for password minimum length. */
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly passwordCntrl: FormControl<string | null>;
  public readonly user$: MaybeUser$;

  constructor() {
    ({ $errors: this.$email1CntrlErrors, $invalid: this.$email1CntrlInvalid, control: this.email1Cntrl } = createEmailControl());
    ({ $errors: this.$email2CntrlErrors, $invalid: this.$email2CntrlInvalid, control: this.email2Cntrl } = createEmailControl());
    ({ $errors: this.$passwordCntrlErrors, $invalid: this.$passwordCntrlInvalid, control: this.passwordCntrl } = createPasswordControl());

    this.changeEmailForm = new FormGroup(
      {
        email1: this.email1Cntrl,
        email2: this.email2Cntrl,
        password: this.passwordCntrl,
      },
      confirmMatch('email1', 'email2'),
    );

    this.$formEmailsInvalid = confirmMatchFormErrors(this.changeEmailForm, this.email1Cntrl, this.email2Cntrl);

    this.$errorCode = signal<string>('');
    this.$verificationStatus = signal<SendVerifyEmailStatuses>('unsent');

    // Not handling non-logged in users because the Route guards should.
    this.user$ = inject(USER$);
  }

  /**
   * Re-authenticates the current user using the submitted password then sends an email to the new
   * address to confirm ownership. Clicking the link in the email will apply the oobCode using
   * VerifyEmailComponent.
   */
  public async onSubmit(user: User): Promise<void> {
    const { email1, password } = this.changeEmailForm.value;

    // Validators prevent email1 or password being falsy, but TypeScript doesn't know that.
    // Additionally, all users are expected to have an email address.
    if (this.changeEmailForm.invalid || !email1 || !password || !user.email) {
      throw new Error('Invalid form submitted');
    }

    this.$errorCode.set(''); // Clear out any existing errors
    this.$verificationStatus.set('sending');

    try {
      const emailCreds = EmailAuthProvider.credential(user.email, password);
      const credentials = await reauthenticateWithCredential(user, emailCreds);
      await verifyBeforeUpdateEmail(credentials.user, email1);
      this.$verificationStatus.set('sent');
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
      this.$verificationStatus.set('unsent');
    }
  }
}
