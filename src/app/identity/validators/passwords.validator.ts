import type { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import type {
  AbstractControl,
  FormControl,
  FormControlStatus,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import type { Observable } from 'rxjs';

import { FORMS } from '@app/shared/constants';

const ERROR_NAME = 'passwordsmatch';

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

    // eslint-disable-next-line unicorn/no-null -- Angular forms use null
    return password1Cntrl.value === password2Cntrl.value ? null : { [ERROR_NAME]: true };
  };

/**
 * Only display the passwordsmatch error if the two password controls are valid, and the form has
 * the error.
 */
export const passwordsMatchFormErrors = (form: FormGroup, password1: FormControl, password2: FormControl): Signal<boolean> => {
  const initialValue: boolean = form.invalid && password1.valid && password2.valid && form.errors?.[ERROR_NAME] != undefined;

  const formStatus$: Observable<boolean> = form.statusChanges.pipe(
    // Wait for input to stop before displaying error messages
    debounceTime(FORMS.inputDebounce),
    map((status: FormControlStatus): boolean => {
      const { errors } = form;
      if (status === 'INVALID' && password1.valid && password2.valid && errors) {
        return 'passwordsmatch' in errors;
      }
      return false;
    }),
  );

  return toSignal(formStatus$, { initialValue });
};
