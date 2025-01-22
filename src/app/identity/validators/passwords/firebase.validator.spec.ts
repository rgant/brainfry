import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import type { AsyncValidatorFn } from '@angular/forms';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import validatePasswordResponse from '@testing/firebase-validate-password.json';
import { provideEmulatedAuth, setValidatePassword } from '@testing/helpers';

import { passwordFirebaseValidator } from './firebase.validator';

describe('passwordFirebaseValidator', (): void => {
  /* eslint-disable unicorn/no-null -- ValidatorFn returns null */
  let control: FormControl;
  let validator: AsyncValidatorFn;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [
        provideOurFirebaseApp(),
        // Emulator does not support testing `validatePassword`
        // FirebaseError: Firebase: Error (auth/identitytoolkit.getpasswordpolicy-is-not-implemented-in-the-auth-emulator.)
        provideEmulatedAuth(),
      ],
    });

    control = new FormControl();
    validator = TestBed.runInInjectionContext((): AsyncValidatorFn => passwordFirebaseValidator());
  });

  it('should handle empty values', async (): Promise<void> => {
    expect(control.value).toBeNull();
    await expectAsync(validator(control)).toBeResolvedTo(null);

    control.setValue('');

    await expectAsync(validator(control)).toBeResolvedTo(null);
  });

  it('should validate the password against Firebase Policy', async (): Promise<void> => {
    // validatePasswordResponse was generated against the actual API by not spying on the
    // `validatePassword` method and using the real Auth.
    const invalidPasswordResponse = { ...validatePasswordResponse, isValid: false };
    const { passwordPolicy: _, ...expectedStatus } = invalidPasswordResponse;

    setValidatePassword(false);
    control.setValue('96156b78');

    await expectAsync(validator(control)).toBeResolvedTo({ firebasevalidator: expectedStatus });
  });
});
