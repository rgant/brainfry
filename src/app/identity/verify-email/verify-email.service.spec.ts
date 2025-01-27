import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { provideEmulatedAuth } from '@testing/utilities';

import { cleanupUsers, createOobCode } from '../testing/oob-codes.spec';
import { VerifyEmailService } from './verify-email.service';

describe('VerifyEmailService', (): void => {
  let auth: Auth;
  let service: VerifyEmailService;
  let testOobCode: string;

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
    ({ oobCode: testOobCode, user } = await createOobCode(auth, 'sendEmailVerification'));
    testUsers.push(user);

    service = TestBed.inject(VerifyEmailService);
  });

  it('should verify email', async (): Promise<void> => {
    const result = await service.verifyEmail(testOobCode, undefined);

    expect(result).toEqual({
      continueUrl: '/',
      verified: true,
    });
  });

  it('should return custom continueUrl', async (): Promise<void> => {
    const result = await service.verifyEmail(testOobCode, '/foo/bar/baz');

    expect(result).toEqual({
      continueUrl: '/foo/bar/baz',
      verified: true,
    });
  });

  it('should handle missing oobCode', async (): Promise<void> => {
    const result = await service.verifyEmail('');

    expect(result).toEqual({
      continueUrl: '/',
      errorCode: 'oobCode not found',
      verified: false,
    });
  });

  it('should handle invalid oobCode', async (): Promise<void> => {
    const result = await service.verifyEmail('bad code');

    expect(result).toEqual({
      continueUrl: '/',
      errorCode: 'auth/invalid-action-code',
      verified: false,
    });
  });
});
