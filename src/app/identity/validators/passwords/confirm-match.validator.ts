import { FormGroup } from '@angular/forms';
import type {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export const ERROR_NAME = 'passwordsmatch';

/**
 * Usage:
 * ```
 *   new FormGroup(
 *    {
 *      password1: new FormControl(null, [ Validators.required, Validators.minLength(num), Validators.maxLength(num) ]),
 *      password2: new FormControl(null, [ Validators.required, Validators.minLength(num), Validators.maxLength(num) ]),
 *    },
 *    { validators: passwordsMatch('password1', 'password2') },
 *  );
 * ```
 */
export const passwordsMatch = (password1: string, password2: string): ValidatorFn =>
  // control: AbstractControl is required by the type ValidatorFn, but the actual expected type is FormGroup.
  (formGrp: AbstractControl): ValidationErrors | null => {
    if (!(formGrp instanceof FormGroup)) {
      throw new TypeError('Control must be an instance of FormGroup.');
    }

    const password1Cntrl = formGrp.get(password1);
    const password2Cntrl = formGrp.get(password2);

    if (!password1Cntrl) {
      throw new Error(`Cannot find FormControl named '${password1}'.`);
    }
    if (!password2Cntrl) {
      throw new Error(`Cannot find FormControl named '${password2}'.`);
    }

    // eslint-disable-next-line unicorn/no-null -- ValidatorFn returns null
    return password1Cntrl.value === password2Cntrl.value ? null : { [ERROR_NAME]: true };
  };
