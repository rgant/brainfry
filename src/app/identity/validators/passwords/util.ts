import type { AbstractControl } from '@angular/forms';

export const getPasswordControlValue = (control: AbstractControl<unknown>): string | null => {
  const { value } = control;

  // Like Validators.email, rely on Validators.required to check for blank passwords.
  if (value == undefined || value === '') {
    return null; // eslint-disable-line unicorn/no-null -- ValidatorFn returns null
  }

  if (typeof value !== 'string') {
    throw new TypeError(`Invalid Control Value Type: '${typeof value}'`);
  }

  return value;
};
