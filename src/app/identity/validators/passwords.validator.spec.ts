import type { Signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { FORMS } from '@app/shared/constants';

import { passwordsMatch, passwordsMatchFormErrors, passwordStrengthValidator } from './passwords.validator';

describe('passwordsMatch Validator', (): void => {
  it('should throw error if not used with FormGroup', (): void => {
    const passwordCntrl = new FormControl('4e174726-e003-4eb3');
    const validatorFn = passwordsMatch('password1', 'password2');

    expect((): void => { validatorFn(passwordCntrl); }).toThrowError('Control must be an instance of FormGroup.');
  });

  it('should throw error for missing control', (): void => {
    const testForm = new FormGroup({
      password1: new FormControl('573b0e34-a5e9-43b2'),
      password2: new FormControl('a73e-4cdb3dcabf6d'),
    });
    let validatorFn = passwordsMatch('missing1', 'password2');

    expect((): void => { validatorFn(testForm); }).toThrowError("Cannot find FormControl named 'missing1'.");

    validatorFn = passwordsMatch('password1', 'missing2');

    expect((): void => { validatorFn(testForm); }).toThrowError("Cannot find FormControl named 'missing2'.");
  });

  it('should match passwords', (): void => {
    const testForm = new FormGroup({
      password1: new FormControl('8e1d130d-6082'),
      password2: new FormControl('8e1d130d-6082'),
    });
    const validatorFn = passwordsMatch('password1', 'password2');

    expect(validatorFn(testForm)).toBeNull();
  });

  it('should flag mismatched passwords', (): void => {
    const testForm = new FormGroup({
      password1: new FormControl('8e1d130d-6082'),
      password2: new FormControl('4d6d-ba63-971f9ab55325'),
    });
    const validatorFn = passwordsMatch('password1', 'password2');

    expect(validatorFn(testForm)).toEqual({ passwordsmatch: true });
  });

  it('should work as part of FormGroup creation', (): void => {
    const testForm = new FormGroup(
      {
        password1: new FormControl('8f61270a-c410-442e'),
        password2: new FormControl('a73e-4cdb3dcabf6d'),
      },
      { validators: passwordsMatch('password1', 'password2') },
    );

    if (testForm.errors) {
      expect(testForm.errors['passwordsmatch']).toBe(true);
    } else {
      fail('testForm has no errors property');
    }

    testForm.controls.password2.setValue('8f61270a-c410-442e');

    expect(testForm.errors).withContext('testForm.errors').toBeNull();
  });
});

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

describe('passwordStrengthValidator', (): void => {
  let control: FormControl;

  beforeEach((): void => {
    control = new FormControl();
  });

  it('should handle empty values', (): void => {
    expect(control.value).toBeNull();
    expect(passwordStrengthValidator(control)).toBeNull();

    control.setValue('');

    expect(passwordStrengthValidator(control)).toBeNull();
  });

  it('should error on incorrect types', (): void => {
    const badValue = 1234;
    control.setValue(badValue);

    expect((): void => { passwordStrengthValidator(control); }).toThrowError("Invalid Control Value Type: 'number'");
  });

  it('should validate weak passwords', (): void => {
    control.setValue('abcd1234');

    expect(passwordStrengthValidator(control)).toEqual({ passwordstrength: 'Weak' });
  });

  it('should allow medium or better passwords', (): void => {
    control.setValue('f8G1f4^4b8');

    expect(passwordStrengthValidator(control)).toBeNull();
  });
});
