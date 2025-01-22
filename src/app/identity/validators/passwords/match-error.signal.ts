import type { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { FormControl, FormControlStatus, FormGroup } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import type { Observable } from 'rxjs';

import { FORMS } from '@app/shared/constants';

import { ERROR_NAME } from './confirm-match.validator';

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
