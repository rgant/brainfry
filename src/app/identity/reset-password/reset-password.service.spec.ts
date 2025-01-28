import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { bufferCount, first, skip } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { provideEmulatedAuth } from '@testing/utilities';

import { cleanupUsers, createOobCode } from '../testing/oob-codes.spec';
import { ResetPasswordService } from './reset-password.service';
import type { ResetPasswordResults } from './reset-password.service';

describe('ResetPasswordService', (): void => {
  let auth: Auth;
  let service: ResetPasswordService;
  let testOobCode: string;
  let testEmail: string;

  // newPasswordSubject$ will emit twice for each `.next()` value.
  const confirmPasswordResetEmissions = 2;
  const delayReplacePassword = 5; // Milliseconds
  const testUsers: User[] = [];

  // This is really only necessary so that we don't export these users from the emulator
  afterAll(async (): Promise<void> => {
    await cleanupUsers(auth, testUsers);
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
    service.resetPassword$(testOobCode).pipe(first()).subscribe({
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

  it('should handle invalid code', (done: DoneFn): void => {
    service.resetPassword$('badcode').pipe(first()).subscribe({
      complete: done,
      error: fail,
      next: (data: ResetPasswordResults): void => {
        expect(data).withContext('ShowForm').toEqual({
          email: undefined,
          errorCode: 'auth/invalid-action-code',
          showForm: false,
        });
      },
    });
  });

  it('should handle missing code', (done: DoneFn): void => {
    service.resetPassword$(undefined).pipe(first()).subscribe({
      complete: done,
      error: fail,
      next: (data: ResetPasswordResults): void => {
        expect(data).withContext('ShowForm').toEqual({
          email: undefined,
          errorCode: 'oobCode not found',
          showForm: false,
        });
      },
    });
  });

  it('should replace password', (done: DoneFn): void => {
    service.resetPassword$(testOobCode)
      .pipe(
        // Using a `tap` to call `service.replacePassword` after the _verifyCode emission is not
        // enough of a delay sadly.
        skip(1), // Skip the _verifyCode emission,
        bufferCount(confirmPasswordResetEmissions),
        first(),
      ).subscribe({
        complete: done,
        error: fail,
        next: (buffer: ResetPasswordResults[]): void => {
          expect(buffer).toEqual([
            undefined, // Show spinner
            { errorCode: undefined, showForm: false }, // _confirmPasswordReset success
          ]);
        },
      });

    // Need to wait for the _verifyCode promise to settle before we can set the password.
    setTimeout((): void => { service.replacePassword('8RfVf)=`+z/a{cs'); }, delayReplacePassword);
  });

  it('should handle confirmPasswordReset error', (done: DoneFn): void => {
    service.resetPassword$(testOobCode)
      .pipe(
        skip(1), // Skip the _verifyCode emission,
        bufferCount(confirmPasswordResetEmissions),
        first(),
      ).subscribe({
        complete: done,
        error: fail,
        next: (buffer: ResetPasswordResults[]): void => {
          expect(buffer).toEqual([
            undefined, // Show spinner
            { email: testEmail, errorCode: 'auth/weak-password', showForm: true }, // _confirmPasswordReset failure
          ]);
        },
      });

    // Need to wait for the _verifyCode promise to settle before we can set the password.
    setTimeout((): void => { service.replacePassword('shOI'); }, delayReplacePassword);
  });

  it('should recover from confirmPasswordReset error', (done: DoneFn): void => {
    service.resetPassword$(testOobCode)
      .pipe(
        bufferCount(1 + confirmPasswordResetEmissions + confirmPasswordResetEmissions),
        first(),
      ).subscribe({
        complete: done,
        error: fail,
        next: (buffer: ResetPasswordResults[]): void => {
          expect(buffer).toEqual([
            { email: testEmail, showForm: true }, // _verifyCode
            undefined, // Show spinner
            { email: testEmail, errorCode: 'auth/weak-password', showForm: true }, // _confirmPasswordReset failure
            undefined, // Show spinner
            { errorCode: undefined, showForm: false }, // _confirmPasswordReset success
          ]);
        },
      });

    // Need to wait for the _verifyCode promise to settle before we can set the password.
    setTimeout((): void => { service.replacePassword('shOI'); }, delayReplacePassword);
    setTimeout((): void => { service.replacePassword('cshOIkxB])51]*W'); }, delayReplacePassword + delayReplacePassword);
  });
});
