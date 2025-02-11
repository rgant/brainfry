import type { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PristineChangeEvent, StatusChangeEvent, TouchedChangeEvent } from '@angular/forms';
import type { AbstractControl, ControlEvent } from '@angular/forms';
import { distinctUntilChanged, map, scan } from 'rxjs';
import type { Observable } from 'rxjs';

/**
 * Angular AbstractControl properties that are used to determine if the control should signal an
 * invalid state.
 */
interface ControlProperties {
  /** Control value has been modified. */
  readonly dirty: boolean;
  /** Control value fails validation. */
  readonly invalid: boolean;
  /** Control has been focused in the view. */
  readonly touched: boolean;
}

/**
 * When all the ControlProperties are true then the Control is invalid.
 */
const isInvalid = (properties: ControlProperties): boolean => {
  let invalid = true;

  for (const val of Object.values(properties)) {
    invalid &&= Boolean(val);
  }

  return invalid;
};

/**
 * Create an Angular Signal that flags as modified and invalid based on the Control properties.
 *
 * 1. Invalid - the value fails validation checks.
 * 2. Dirty - the value is different from the initial value.
 * 3. Touched - the Control has been focused during the current view.
 *
 * This ensures that the aria-invalid attribute is only set on Controls that the user has interacted
 * with.
 */
export const controlInvalidSignal = (control: AbstractControl): Signal<boolean> => {
  const defaultProperties: ControlProperties = {
    dirty: control.dirty,
    invalid: control.invalid,
    touched: control.touched,
  };
  const initialValue = isInvalid(defaultProperties);

  const controlEvents$: Observable<boolean> = control.events.pipe(
    scan(
      (current: ControlProperties, event: ControlEvent<unknown>): ControlProperties => {
        if (event instanceof PristineChangeEvent) {
          return { ...current, dirty: !event.pristine };
        }

        if (event instanceof TouchedChangeEvent) {
          return { ...current, touched: event.touched };
        }

        if (event instanceof StatusChangeEvent) {
          return { ...current, invalid: event.status === 'INVALID' };
        }

        return current;
      },
      defaultProperties,
    ),
    map((properties: ControlProperties): boolean => isInvalid(properties)),
    distinctUntilChanged(),
  );

  return toSignal(controlEvents$, { initialValue });
};
