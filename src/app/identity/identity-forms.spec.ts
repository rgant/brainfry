import { TestBed } from '@angular/core/testing';

import { createEmailControl, createPasswordControl } from './identity-forms';
import type { ControlStruct } from './identity-forms';
import { emailControlTest } from './testing/email-field.spec';
import { passwordControlTest } from './testing/password-field.spec';

describe('Identity Forms', (): void => {
  beforeEach((): void => {
    TestBed.configureTestingModule({});
  });

  it('should create email control and signals', (): void => {
    const { $errors, $invalid, control } = TestBed.runInInjectionContext((): ControlStruct => createEmailControl());
    emailControlTest(control);

    expect($errors).toBeTruthy();
    expect($invalid).toBeTruthy();
  });

  it('should create password control and signals', (): void => {
    const { $errors, $invalid, control } = TestBed.runInInjectionContext((): ControlStruct => createPasswordControl());
    passwordControlTest(control);

    expect($errors).toBeTruthy();
    expect($invalid).toBeTruthy();
  });
});
