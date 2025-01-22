import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { passwordStrength } from 'check-password-strength';

import { PASSWORDS } from '@app/shared/constants';

import { getPasswordControlValue } from './util';

export const passwordStrengthValidator: ValidatorFn = (control: AbstractControl<unknown>): ValidationErrors | null => {
  const value = getPasswordControlValue(control);

  // Like Validators.email, rely on Validators.required to check for blank passwords.
  if (value == undefined) {
    return null; // eslint-disable-line unicorn/no-null -- ValidatorFn returns null
  }

  const strength = passwordStrength(value);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Enum is just a bag of values
  return strength.id < PASSWORDS.minStrength ? { passwordstrength: strength.value } : null; // eslint-disable-line unicorn/no-null
};
