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

interface CombinedObs {
  dirty: boolean;
  errors: ValidationErrors | undefined;
}

export const MESSAGE_DELAY = 500; // Milliseconds

export const controlErrorsSignal = (control: AbstractControl): Signal<ValidationErrors | undefined> => {
  // Only care about dirty controls for purposes of displaying validation error messages.
  const emailCntrlDirty$: Observable<boolean> = control.events.pipe(
    filter((event: ControlEvent<unknown>): event is PristineChangeEvent => event instanceof PristineChangeEvent),
    map((event: PristineChangeEvent): boolean => !event.pristine),
  );

  // When status is INVALID emit control.errors, otherwise undefined
  const emailCntrlStatus$: Observable<ValidationErrors | undefined> = control.statusChanges.pipe(
    // Wait for input to stop before displaying error messages
    debounceTime(MESSAGE_DELAY),
    map((status: FormControlStatus): ValidationErrors | undefined => {
      const { errors } = control;
      if (status === 'INVALID' && errors) {
        return errors;
      }
      return undefined;
    }),
  );

  // Combine the Observables so that ValidationErrors are emitted only when the control is dirty.
  const emailCntrlErrors$: Observable<ValidationErrors | undefined> = combineLatest({
    /* eslint-disable rxjs/finnish */
    dirty: emailCntrlDirty$,
    errors: emailCntrlStatus$,
  }).pipe(
    map(({ dirty, errors }: CombinedObs): ValidationErrors | undefined => {
      if (dirty) {
        return errors;
      }

      return undefined;
    }),
  );

  return toSignal(emailCntrlErrors$);
};
