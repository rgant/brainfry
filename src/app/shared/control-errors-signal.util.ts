import type { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PristineChangeEvent } from '@angular/forms';
import type {
  AbstractControl,
  ControlEvent,
  FormControlStatus,
  ValidationErrors,
} from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  filter,
  map,
} from 'rxjs';
import type { Observable } from 'rxjs';

import { FORMS } from './constants';

/**
 * `combinedLatest` output from inner AbstractControl Observables.
 */
interface CombinedObs {
  /** Indicates that the Control value has been modified by the user. */
  readonly dirty: boolean;
  /** If the Control is invalid then contains the ValidationErrors, otherwise `undefined`. */
  readonly errors: ValidationErrors | undefined;
}

/**
 * Creates an Angular Signal that emits the validation errors for a Control only when the Control is
 * also modified (dirty).
 */
export const controlErrorsSignal = (control: AbstractControl): Signal<ValidationErrors | undefined> => {
  // Only care about dirty controls for purposes of displaying validation error messages.
  const controlDirty$: Observable<boolean> = control.events.pipe(
    filter((event: ControlEvent<unknown>): event is PristineChangeEvent => event instanceof PristineChangeEvent),
    map((event: PristineChangeEvent): boolean => !event.pristine),
  );

  // When status is INVALID emit control.errors, otherwise undefined
  const controlStatus$: Observable<ValidationErrors | undefined> = control.statusChanges.pipe(
    // Wait for input to stop before displaying error messages
    debounceTime(FORMS.inputDebounce),
    map((status: FormControlStatus): ValidationErrors | undefined => {
      const { errors } = control;
      if (status === 'INVALID' && errors) {
        return errors;
      }
      return undefined;
    }),
  );

  // Combine the Observables so that ValidationErrors are emitted only when the control is dirty.
  const controlErrors$: Observable<ValidationErrors | undefined> = combineLatest({
    /* eslint-disable rxjs/finnish */
    dirty: controlDirty$,
    errors: controlStatus$,
  }).pipe(
    map(({ dirty, errors }: CombinedObs): ValidationErrors | undefined => {
      if (dirty) {
        return errors;
      }

      return undefined;
    }),
  );

  return toSignal(controlErrors$);
};
