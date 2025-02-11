import type { Signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors } from '@angular/forms';

import { PASSWORDS } from '@app/shared/constants';
import { controlErrorsSignal } from '@app/shared/control-errors-signal.util';
import { controlInvalidSignal } from '@app/shared/control-invalid-signal.util';

import { passwordFirebaseValidator, passwordStrengthValidator } from './validators/passwords';

/**
 * Pair control with Angular Signals for handling validation in the template.
 */
const getControlStructure = <T extends AbstractControl>(control: T): ControlStruct<T> => {
  const $invalid = controlInvalidSignal(control);
  const $errors = controlErrorsSignal(control);

  return { $errors, $invalid, control };
};

export { PASSWORDS };

/**
 * For each Identity Control generate two Signals for error handling.
 */
export interface ControlStruct<T extends AbstractControl = FormControl> {
  /** Returns errors for the control, but only when the control is dirty. */
  readonly $errors: Signal<ValidationErrors | undefined>;
  /** Flag for aria-invalid, but only when the control is modified, invalid, and interacted with. */
  readonly $invalid: Signal<boolean>;
  /** Identity control. */
  readonly control: T;
}

/**
 * Emails are required and must be a valid email address.
 */
export const createEmailControl = (): ControlStruct<FormControl> => {
  // eslint-disable-next-line unicorn/no-null -- DOM forms use null
  const control = new FormControl<string | null>(null, [ Validators.required, Validators.email ]);
  return getControlStructure(control);
};

/**
 * Passwords are required and have length requirements. Complexity is required for new password fields.
 * @param isNewPassword - Adds extra validators to control when being used to create a new password.
 *                      Note: this should only be used on the first password field, not the confirm
 *                      field.
 */
export const createPasswordControl = (isNewPassword: boolean = false): ControlStruct<FormControl> => {
  const control = new FormControl<string | null>(
    null, // eslint-disable-line unicorn/no-null -- DOM forms use null
    [
      Validators.required,
      Validators.minLength(PASSWORDS.minLength),
      Validators.maxLength(PASSWORDS.maxLength),
    ],
  );

  if (isNewPassword) {
    control.addValidators(passwordStrengthValidator);
    control.addAsyncValidators(passwordFirebaseValidator());
  }

  return getControlStructure(control);
};
