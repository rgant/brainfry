import type { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { controlInvalidSignal } from './control-invalid-signal.util';

const createSignal = (control: FormControl): Signal<boolean> =>
  TestBed.runInInjectionContext((): Signal<boolean> => controlInvalidSignal(control));

describe('controlInvalidSignal', (): void => {
  beforeEach((): void => {
    TestBed.configureTestingModule({});
  });

  it('should default to inital state', (): void => {
    const theControl = new FormControl();

    theControl.markAsDirty();
    theControl.markAsTouched();
    theControl.setErrors({ bad: true });

    const $theSignal = createSignal(theControl);

    expect($theSignal()).toBeTrue();
  });

  it('should only emit when all properties are true', (): void => {
    const theControl = new FormControl();
    const $theSignal = createSignal(theControl);

    expect($theSignal()).toBeFalse();

    theControl.markAsDirty();

    expect($theSignal()).toBeFalse();

    theControl.setErrors({ bad: true });

    expect($theSignal()).toBeFalse();

    theControl.markAsTouched();

    expect($theSignal()).toBeTrue();
  });
});
