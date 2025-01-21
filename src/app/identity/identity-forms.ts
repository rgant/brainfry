import type { Signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors } from '@angular/forms';

import { PASSWORDS } from '@app/shared/constants';
import { controlErrorsSignal } from '@app/shared/control-errors-signal.util';
import { controlInvalidSignal } from '@app/shared/control-invalid-signal.util';

import { passwordStrengthValidator } from './validators/passwords.validator';

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

export const createPasswordControl = (validateStrength: boolean = false): ControlStruct<FormControl> => {
  const control = new FormControl<string | null>(
    null, // eslint-disable-line unicorn/no-null -- DOM forms use null
    [
      Validators.required,
      Validators.minLength(PASSWORDS.minLength),
      Validators.maxLength(PASSWORDS.maxLength),
    ],
  );

  if (validateStrength) {
    control.addValidators(passwordStrengthValidator);
  }

  return getControlStructure(control);
};
