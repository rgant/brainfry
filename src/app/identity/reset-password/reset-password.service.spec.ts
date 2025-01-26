import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { take } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { provideEmulatedAuth } from '@testing/utilities';

import { cleanupUsers, createOobCode } from '../testing/oob-codes.spec';
import { ResetPasswordService } from './reset-password.service';
import type { ResetPasswordResults } from './reset-password.service';

fdescribe('ResetPasswordService', (): void => {
  let auth: Auth;
  let service: ResetPasswordService;
  let testOobCode: string;
  let testEmail: string;

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
    ({ oobCode: testOobCode, originalEmail: testEmail, user } = await createOobCode(auth, 'sendPasswordResetEmail'));
    testUsers.push(user);

    service = TestBed.inject(ResetPasswordService);
  });

  it('should verify code', (done: DoneFn): void => {
    service.resetPassword$(testOobCode).pipe(take(1)).subscribe({
      complete: done,
      error: fail,
      next: (data: ResetPasswordResults): void => {
        expect(data).withContext('ShowForm').toEqual({
          email: testEmail,
          showForm: true,
        });
      },
    });
  });
});
