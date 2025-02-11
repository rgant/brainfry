import { FormGroup } from '@angular/forms';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** ValidationError property name for `confirmMatch` Validator. */
export const ERROR_NAME = 'confirmmatch';

/**
 * Requires that two controls have the same value to validate the FormGroup.
 *
 * Usage:
 * ```
 *   new FormGroup(
 *    {
 *      password1: new FormControl(null, [ Validators.required, Validators.minLength(num), Validators.maxLength(num) ]),
 *      password2: new FormControl(null, [ Validators.required, Validators.minLength(num), Validators.maxLength(num) ]),
 *    },
 *    { validators: confirmMatch('password1', 'password2') },
 *  );
 * ```
 */
export const confirmMatch = (password1: string, password2: string): ValidatorFn =>
  // control: AbstractControl is required by the type ValidatorFn, but the actual expected type is FormGroup.
  (formGrp: AbstractControl): ValidationErrors | null => {
    if (!(formGrp instanceof FormGroup)) {
      throw new TypeError('Control must be an instance of FormGroup.');
    }

    const control1 = formGrp.get(password1);
    const control2 = formGrp.get(password2);

    if (!control1) {
      throw new Error(`Cannot find FormControl named '${password1}'.`);
    }
    if (!control2) {
      throw new Error(`Cannot find FormControl named '${password2}'.`);
    }

    // eslint-disable-next-line unicorn/no-null -- ValidatorFn returns null
    return control1.value === control2.value ? null : { [ERROR_NAME]: true };
  };
