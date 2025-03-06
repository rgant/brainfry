import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';

import { USER$ } from '~/app/core/user.token';
import type { MaybeUser$ } from '~/app/core/user.token';
import { SpinnerComponent } from '~/app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';
import { createPasswordControl, PASSWORDS } from '../identity-forms';
import { confirmMatch, confirmMatchFormErrors } from '../validators/confirm-match';

/**
 * Collects the User's current password and their new password with confirmation.
 */
type ChangePasswordFormGroup = FormGroup<{
  currentPw: FormControl<string | null>;
  password1: FormControl<string | null>;
  password2: FormControl<string | null>;
}>;

/**
 * Form to change User's password using the current password.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  /** Errors specifically for the current password field. */
  public readonly $currentPwCntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for the current password field. */
  public readonly $currentPwCntrlInvalid: Signal<boolean>;
  /** Firebase response error code. */
  public readonly $errorCode: WritableSignal<string>;
  /** Aria-invalid attribute for the form. */
  public readonly $formPasswordsInvalid: Signal<boolean>;
  /** Errors specifically for the first new password field. */
  public readonly $password1CntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for the first new password field. */
  public readonly $password1CntrlInvalid: Signal<boolean>;
  /** Errors specifically for the second new password field. */
  public readonly $password2CntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for the second new password field. */
  public readonly $password2CntrlInvalid: Signal<boolean>;
  /** Toggle showing the form and spinner */
  public readonly $showForm: WritableSignal<boolean>;
  public readonly changePasswordForm: ChangePasswordFormGroup;
  public readonly currentPwCntrl: FormControl<string | null>;
  /** Used in error message for password maximum length. */
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  /** Used in error message for password minimum length. */
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly password1Cntrl: FormControl<string | null>;
  public readonly password2Cntrl: FormControl<string | null>;
  public readonly user$: MaybeUser$;

  constructor() {
    ({
      $errors: this.$currentPwCntrlErrors,
      $invalid: this.$currentPwCntrlInvalid,
      control: this.currentPwCntrl,
    } = createPasswordControl());
    ({
      $errors: this.$password1CntrlErrors,
      $invalid: this.$password1CntrlInvalid,
      control: this.password1Cntrl,
    } = createPasswordControl(true));
    ({
      $errors: this.$password2CntrlErrors,
      $invalid: this.$password2CntrlInvalid,
      control: this.password2Cntrl,
    } = createPasswordControl());

    this.changePasswordForm = new FormGroup(
      {
        currentPw: this.currentPwCntrl,
        password1: this.password1Cntrl,
        password2: this.password2Cntrl,
      },
      confirmMatch('password1', 'password2'),
    );

    this.$formPasswordsInvalid = confirmMatchFormErrors(this.changePasswordForm, this.password1Cntrl, this.password2Cntrl);

    this.$errorCode = signal<string>('');
    this.$showForm = signal<boolean>(true);

    // Not handling non-logged in users because the Route guards should.
    this.user$ = inject(USER$);
  }

  /**
   * Re-authenticates use using the submitted current password, and then updates the password using
   * the new password from the form.
   */
  public async onSubmit(user: User): Promise<void> {
    const { currentPw, password1 } = this.changePasswordForm.value;

    // Validators prevent email1 or password being falsy, but TypeScript doesn't know that.
    // Additionally, all users are expected to have an email address.
    if (this.changePasswordForm.invalid || !currentPw || !password1 || !user.email) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
    this.$errorCode.set(''); // Clear out any existing errors

    try {
      const emailCreds = EmailAuthProvider.credential(user.email, currentPw);
      const credentials = await reauthenticateWithCredential(user, emailCreds);
      await updatePassword(credentials.user, password1);
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
    }

    this.$showForm.set(true);
  }
}
