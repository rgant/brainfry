import type { Signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { FORMS } from '@app/shared/constants';

import { passwordsMatchFormErrors } from './match-error.signal';

const createSignal = (theForm: FormGroup, pw1Cntrl: FormControl, pw2Cntrl: FormControl): Signal<boolean> =>
  TestBed.runInInjectionContext((): Signal<boolean> => passwordsMatchFormErrors(theForm, pw1Cntrl, pw2Cntrl));

describe('passwordsMatchFormErrors', (): void => {
  let pw1Cntrl: FormControl;
  let pw2Cntrl: FormControl;
  let theForm: FormGroup;

  beforeEach((): void => {
    TestBed.configureTestingModule({});

    pw1Cntrl = new FormControl();
    pw2Cntrl = new FormControl();
    theForm = new FormGroup({
      password1: pw1Cntrl,
      password2: pw2Cntrl,
    });
  });

  it('should emit inital status', (): void => {
    theForm.setErrors({ passwordsmatch: true });

    const $errors = createSignal(theForm, pw1Cntrl, pw2Cntrl);

    expect($errors()).toBe(true);
  });

  it('should emit form error when controls are valid', fakeAsync((): void => {
    const $errors = createSignal(theForm, pw1Cntrl, pw2Cntrl);

    expect($errors()).toBe(false);

    theForm.setErrors({ passwordsmatch: true });
    tick(FORMS.inputDebounce);

    expect($errors()).toBe(true);

    pw2Cntrl.setErrors({ bad: true });
    tick(FORMS.inputDebounce);

    expect($errors()).toBe(false);
  }));

  it('should only emit for passwords match errors', fakeAsync((): void => {
    theForm.setErrors({ bad: true });

    const $errors = createSignal(theForm, pw1Cntrl, pw2Cntrl);

    expect($errors()).toBe(false);

    theForm.setErrors({ bad: true, worse: true });
    tick(FORMS.inputDebounce);

    expect($errors()).toBe(false);
  }));
});
