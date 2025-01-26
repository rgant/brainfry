import {
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FirebaseError } from '@angular/fire/app';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { provideEmulatedAuth } from '@testing/utilities';

import { cleanupUsers, createOobCode } from '../testing/oob-codes.spec';
import { RecoverEmailService, SEND_EMAIL_DELAY } from './recover-email.service';
import type { RecoverEmailResults } from './recover-email.service';

// Because I cannot get fakeAsync working, need to remove the delay before sending the email during
// tests. Ideally I can find a way to remove that parameter
const DELAY_FOR_TESTING = 0;

describe('RecoverEmailService', (): void => {
  let auth: Auth;
  let service: RecoverEmailService;
  let testOobCode: string;
  let testOriginalEmail: string;

  const testUsers: User[] = [];

  // This is really only necessary so that we don't export these users from the emulator
  afterAll(async (): Promise<void> => {
    await cleanupUsers(testUsers);
  });

  beforeEach(async (): Promise<void> => {
    TestBed.configureTestingModule({
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth() ],
    });

    auth = TestBed.inject(Auth);

    let user: User;
    ({ oobCode: testOobCode, originalEmail: testOriginalEmail, user } = await createOobCode(auth, 'updateEmail'));
    testUsers.push(user);

    service = TestBed.inject(RecoverEmailService);
  });

  it('should recover email sync', (done: DoneFn): void => {
    service.recoverEmail$(testOobCode, DELAY_FOR_TESTING).subscribe({
      complete: done,
      error: fail,
      next: (data: RecoverEmailResults): void => {
        expect(data).withContext('RecoverEmailResults').toEqual({
          passwordResetSent: true,
          restoredEmail: testOriginalEmail,
          successful: true,
        });
      },
    });
  });

  // Cannot get `fakeAsync` testing to work with `checkActionCode` and `applyActionCode`.
  // This causes a FirebaseError auth/network-request-failed, but would be a better test with the delay.
  xit('should recover email fakeAsync', fakeAsync((): void => {
    service.recoverEmail$(testOobCode).subscribe({
      error: fail,
      next: (data: RecoverEmailResults): void => {
        expect(data).withContext('RecoverEmailResults').toEqual({
          passwordResetSent: true,
          restoredEmail: testOriginalEmail,
          successful: true,
        });
      },
    });

    tick(SEND_EMAIL_DELAY);
    flush(); // Makes the promises actually settle, but causes auth/network-request-failed FirebaseError
  }));

  it('should gracefully handle errors', (done: DoneFn): void => {
    const badCode = 'wtuoeNEd_2a1_1q7Ikotm6upGJ3WPdOLbbnOMjeHTl5vcUa-am91ws';
    const consoleSpy = spyOn(console, 'error');
    const expectedError = new FirebaseError('auth/invalid-action-code', 'Firebase: Error (auth/invalid-action-code).');

    service.recoverEmail$(badCode, DELAY_FOR_TESTING).subscribe({
      complete: done,
      error: fail,
      next: (data: RecoverEmailResults): void => {
        expect(data).withContext('RecoverEmailResults').toEqual({
          errorCode: 'auth/invalid-action-code',
          passwordResetSent: false,
          successful: false,
        });

        expect(consoleSpy).toHaveBeenCalledOnceWith('RecoverEmailComponent', expectedError);
      },
    });
  });
});
