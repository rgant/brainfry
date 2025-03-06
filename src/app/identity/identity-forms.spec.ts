import { TestBed } from '@angular/core/testing';

import { provideOurFirebaseApp } from '~/app/core/firebase-app.provider';
import { provideEmulatedAuth } from '~/testing/utilities';

import { createEmailControl, createPasswordControl } from './identity-forms';
import type { ControlStruct } from './identity-forms';
import { emailControlTest } from './testing/email-field.spec';
import { passwordControlTest } from './testing/password-field.spec';

describe('Identity Forms', (): void => {
  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth() ],
    });
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

  it('should create password control with strength check', (): void => {
    const { control } = TestBed.runInInjectionContext((): ControlStruct => createPasswordControl(true));

    control.setValue('1ed8be94-cbec');

    expect(control.errors).toEqual({ passwordstrength: 'Weak' });
  });
});
