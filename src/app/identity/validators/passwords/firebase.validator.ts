import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Auth, validatePassword } from '@angular/fire/auth';
import type { PasswordValidationStatus } from '@angular/fire/auth';
import type { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

import { getPasswordControlValue } from './util';

/**
 * Validate against the Firebase Project Authentication Password Policy.
 *
 * Note: at this time there is no actual need for this because the policy only enforces length and
 * other Validators already check for that. However it is nice to know how to do this.
 */
export const passwordFirebaseValidator = (): AsyncValidatorFn => {
  const auth: Auth = inject(Auth);
  const environmentInjector = inject(EnvironmentInjector);

  return async (control: AbstractControl<unknown>): Promise<ValidationErrors | null> => {
    const value = getPasswordControlValue(control);

    // Like Validators.email, rely on Validators.required to check for blank passwords.
    if (value == undefined) {
      return null; // eslint-disable-line unicorn/no-null -- ValidatorFn returns null
    }

    // Opened an issue about this being necessary: https://github.com/angular/angularfire/issues/3614
    const { passwordPolicy: _, ...status } = await runInInjectionContext(
      environmentInjector,
      async (): Promise<PasswordValidationStatus> => validatePassword(auth, value),
    );

    return status.isValid ? null : { firebasevalidator: status }; // eslint-disable-line unicorn/no-null
  };
};
