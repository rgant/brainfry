import type { EnvironmentProviders } from '@angular/core';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import type { Auth, PasswordValidationStatus } from '@angular/fire/auth';

import firebaseSettings from '../../../firebase.json';
import validatePasswordResponse from './firebase-validate-password.json';

let authEmulatorConnected = false;
let validatePasswordIsValid = true;

const resolveValidatePassword = async (): Promise<PasswordValidationStatus> =>
  // validatePasswordResponse was generated against the actual API by not spying on the
  // `validatePassword` method and using the real Auth.
  ({ ...validatePasswordResponse, isValid: validatePasswordIsValid });

/**
 * Provide Firebase Auth, and if not already connected to emulator then do so only the first time
 * this method is called.
 *
 * Since the emulator does not support the calls needed to implement validatePassword, that also
 * is mocked in this setup. The mock response is partly configurable using `setValidatePassword`.
 *
 * Note: both the singlton call to `connectAuthEmulator` and the hacky mocking of the private
 * `validatePassword` method are not ideal. But what would be better designs?
 */
export const provideEmulatedAuth = (): EnvironmentProviders =>
  provideAuth((): Auth => {
    const auth = getAuth();

    // Connecting to the emulator multiple times for each TestBed.configureTestingModule call causes
    // errors: auth/emulator-config-failed
    // But only connecting once, hopefully fixes that.
    // https://np.reddit.com/r/Firebase/comments/18s6wzp/comment/kf6w7hk/
    if (!authEmulatorConnected) {
      const { port } = firebaseSettings.emulators.auth;
      connectAuthEmulator(auth, `http://localhost:${port}`, { disableWarnings: true });
      authEmulatorConnected = true;
    }

    // Auth Emulator does not support testing `validatePassword`
    // FirebaseError: Firebase: Error (auth/identitytoolkit.getpasswordpolicy-is-not-implemented-in-the-auth-emulator.)
    // @ts-expect-error Spying on private method for testing.
    // eslint-disable-next-line jasmine/no-unsafe-spy -- This is a jasmine helper
    spyOn(auth, 'validatePassword').and.callFake(resolveValidatePassword);
    setValidatePassword(true); // This global would pollute tests if not reset for every test. It is also not safe for parallel execution.

    return auth;
  });

/**
 * Sets the isValid field in the mocked validatePassword response to value desired by tests.
 *
 * Note: this is a hack, and shows why all code needs review. But how to make a better design?
 */
export const setValidatePassword = (isValid: boolean): void => {
  validatePasswordIsValid = isValid;
};
