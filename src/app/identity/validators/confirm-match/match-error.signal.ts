import type { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { FormControl, FormControlStatus, FormGroup } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import type { Observable } from 'rxjs';

import { FORMS } from '@app/shared/constants';

import { ERROR_NAME } from './confirm-match.validator';

/**
 * Only display the confirmmatch error if the two controls are valid, and the form has the error.
 */
export const confirmMatchFormErrors = (form: FormGroup, control1: FormControl, control2: FormControl): Signal<boolean> => {
  const initialValue: boolean = form.invalid && control1.valid && control2.valid && form.errors?.[ERROR_NAME] != undefined;

  const formStatus$: Observable<boolean> = form.statusChanges.pipe(
    // Wait for input to stop before displaying error messages
    debounceTime(FORMS.inputDebounce),
    map((status: FormControlStatus): boolean => {
      const { errors } = form;
      if (status === 'INVALID' && control1.valid && control2.valid && errors) {
        return errors[ERROR_NAME] != undefined;
      }
      return false;
    }),
  );

  return toSignal(formStatus$, { initialValue });
};
