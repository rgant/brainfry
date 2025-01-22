import type { Signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors } from '@angular/forms';

import { PASSWORDS } from '@app/shared/constants';
import { controlErrorsSignal } from '@app/shared/control-errors-signal.util';
import { controlInvalidSignal } from '@app/shared/control-invalid-signal.util';

import { passwordFirebaseValidator, passwordStrengthValidator } from './validators/passwords';

const getControlStructure = <T extends AbstractControl>(control: T): ControlStruct<T> => {
  const $invalid = controlInvalidSignal(control);
  const $errors = controlErrorsSignal(control);

  return { $errors, $invalid, control };
};

export interface ControlStruct<T extends AbstractControl = FormControl> {
  $errors: Signal<ValidationErrors | undefined>;
  $invalid: Signal<boolean>;
  control: T;
}

export const createEmailControl = (): ControlStruct<FormControl> => {
  // eslint-disable-next-line unicorn/no-null -- DOM forms use null
  const control = new FormControl<string | null>(null, [ Validators.required, Validators.email ]);
  return getControlStructure(control);
};

/**
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
