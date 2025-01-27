import { FormControl, FormGroup } from '@angular/forms';

import { confirmMatch, ERROR_NAME } from './confirm-match.validator';

describe('confirmMatch Validator', (): void => {
  it('should throw error if not used with FormGroup', (): void => {
    const passwordCntrl = new FormControl('4e174726-e003-4eb3');
    const validatorFn = confirmMatch('password1', 'password2');

    expect((): void => { validatorFn(passwordCntrl); }).toThrowError('Control must be an instance of FormGroup.');
  });

  it('should throw error for missing control', (): void => {
    const testForm = new FormGroup({
      password1: new FormControl('573b0e34-a5e9-43b2'),
      password2: new FormControl('a73e-4cdb3dcabf6d'),
    });
    let validatorFn = confirmMatch('missing1', 'password2');

    expect((): void => { validatorFn(testForm); }).toThrowError("Cannot find FormControl named 'missing1'.");

    validatorFn = confirmMatch('password1', 'missing2');

    expect((): void => { validatorFn(testForm); }).toThrowError("Cannot find FormControl named 'missing2'.");
  });

  it('should match passwords', (): void => {
    const testForm = new FormGroup({
      password1: new FormControl('8e1d130d-6082'),
      password2: new FormControl('8e1d130d-6082'),
    });
    const validatorFn = confirmMatch('password1', 'password2');

    expect(validatorFn(testForm)).toBeNull();
  });

  it('should flag mismatched passwords', (): void => {
    const testForm = new FormGroup({
      password1: new FormControl('8e1d130d-6082'),
      password2: new FormControl('4d6d-ba63-971f9ab55325'),
    });
    const validatorFn = confirmMatch('password1', 'password2');

    expect(validatorFn(testForm)).toEqual({ [ERROR_NAME]: true });
  });

  it('should work as part of FormGroup creation', (): void => {
    const testForm = new FormGroup(
      {
        password1: new FormControl('8f61270a-c410-442e'),
        password2: new FormControl('a73e-4cdb3dcabf6d'),
      },
      { validators: confirmMatch('password1', 'password2') },
    );

    if (testForm.errors) {
      expect(testForm.errors[ERROR_NAME]).toBeTrue();
    } else {
      fail('testForm has no errors property');
    }

    testForm.controls.password2.setValue('8f61270a-c410-442e');

    expect(testForm.errors).withContext('testForm.errors').toBeNull();
  });
});
