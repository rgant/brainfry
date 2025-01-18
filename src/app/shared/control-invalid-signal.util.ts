import type { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PristineChangeEvent, StatusChangeEvent, TouchedChangeEvent } from '@angular/forms';
import type { AbstractControl, ControlEvent } from '@angular/forms';
import { distinctUntilChanged, map, scan } from 'rxjs';
import type { Observable } from 'rxjs';

interface ControlProperties {
  dirty: boolean;
  invalid: boolean;
  touched: boolean;
}

const isInvalid = (properties: ControlProperties): boolean => {
  let invalid = true;

  for (const val of Object.values(properties)) {
    invalid &&= Boolean(val);
  }

  return invalid;
};

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
