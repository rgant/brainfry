import type { Signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import type { ValidationErrors } from '@angular/forms';

import { controlErrorsSignal, MESSAGE_DELAY } from './utilities';

const createSignal = (control: FormControl): Signal<ValidationErrors | undefined> =>
  TestBed.runInInjectionContext((): Signal<ValidationErrors | undefined> => controlErrorsSignal(control));

const HALF = .5;

describe('controlErrorsSignal', (): void => {
  let theControl: FormControl;
  let $theSignal: Signal<ValidationErrors | undefined>;

  beforeEach((): void => {
    TestBed.configureTestingModule({});

    theControl = new FormControl();
    $theSignal = createSignal(theControl);
  });

  it('should only display errors for dirty controls', fakeAsync((): void => {
    expect($theSignal()).toBeUndefined();

    theControl.setErrors({ bad: true });
    tick(MESSAGE_DELAY);

    expect($theSignal()).toBeUndefined();

    theControl.markAsDirty();
    tick(MESSAGE_DELAY);

    expect($theSignal()).toEqual({ bad: true });
  }));

  it('should wait to emit errors', fakeAsync((): void => {
    const delay = MESSAGE_DELAY * HALF;

    theControl.markAsDirty();
    theControl.setErrors({ bad: true });
    tick(delay);

    expect($theSignal()).toBeUndefined();

    tick(delay);

    expect($theSignal()).toEqual({ bad: true });
  }));

  it('should clear errors', fakeAsync((): void => {
    theControl.markAsDirty();
    theControl.setErrors({ bad: true });
    tick(MESSAGE_DELAY);

    expect($theSignal()).toEqual({ bad: true });

    theControl.setErrors(null); // eslint-disable-line unicorn/no-null -- DOM uses null
    tick(MESSAGE_DELAY);

    expect($theSignal()).toBeUndefined();
  }));
});
