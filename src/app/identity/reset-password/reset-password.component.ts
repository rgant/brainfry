/* eslint-disable import-x/max-dependencies -- 11 dependencies */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { Signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { Observable } from 'rxjs';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { getState } from '../actions/get-state';
import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { createPasswordControl, PASSWORDS } from '../identity-forms';
import { confirmMatch, confirmMatchFormErrors } from '../validators/confirm-match';
import { ResetPasswordService } from './reset-password.service';
import type { ResetPasswordResults } from './reset-password.service';

/** Collect and confirm a new password for user's account. */
type ResetPasswordFormGroup = FormGroup<{
  password1: FormControl<string | null>;
  password2: FormControl<string | null>;
}>;

/**
 * Collects and confirm new password to recover user's account with Firebase Authentication.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    RouterLink,
    SpinnerComponent,
  ],
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  /** Form level aria-invalid. */
  public readonly $formPasswordsInvalid: Signal<boolean>;
  /** Errors specific to first password field. */
  public readonly $password1CntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for first password field. */
  public readonly $password1CntrlInvalid: Signal<boolean>;
  /** Errors specific to second password field. */
  public readonly $password2CntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for second password field */
  public readonly $password2CntrlInvalid: Signal<boolean>;
  /** Used in error message for password maximum length. */
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  /** Used in error message for password minimum length. */
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly password1Cntrl: FormControl<string | null>;
  public readonly password2Cntrl: FormControl<string | null>;
  public readonly resetPasswordForm: ResetPasswordFormGroup;
  /** Verification of password reset oobCode. */
  public readonly vm$: Observable<ResetPasswordResults>;

  private readonly _router: Router;
  private readonly _service: ResetPasswordService;

  /**
   * Gets the current navigation statically to obtain the oobCode from Firebase needed to reset the
   * User's password.
   */
  constructor() {
    this._router = inject(Router);
    this._service = inject(ResetPasswordService);

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

    this.resetPasswordForm = new FormGroup(
      {
        password1: this.password1Cntrl,
        password2: this.password2Cntrl,
      },
      confirmMatch('password1', 'password2'),
    );

    this.$formPasswordsInvalid = confirmMatchFormErrors(this.resetPasswordForm, this.password1Cntrl, this.password2Cntrl);

    const { oobCode } = getState(this._router.getCurrentNavigation());
    this.vm$ = this._service.resetPassword$(oobCode);
  }

  /**
   * Replace the user's password with the new password from the form.
   */
  public onSubmit(): void {
    const { password1 } = this.resetPasswordForm.value;

    if (this.resetPasswordForm.invalid || !password1) {
      throw new Error('Invalid form submitted');
    }

    this._service.replacePassword(password1);
  }
}
