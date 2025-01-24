import { TestBed } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { DEFAULT_TEST_USER, UNVERIFIED_TEST_USER } from '@testing/constants';
import { TestComponent } from '@testing/test.component';
import { provideEmulatedAuth } from '@testing/utilities';

import { emailVerifiedGuard } from './email-verified.guard';

describe('emailVerifiedGuard', (): void => {
  let auth: Auth;
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async (): Promise<void> => {
    TestBed.configureTestingModule({
      providers: [
        provideOurFirebaseApp(),
        provideEmulatedAuth(),
        provideRouter([
          {
            path: '',
            canActivateChild: [ emailVerifiedGuard ],
            children: [ { path: 'verified-required-child', component: TestComponent } ],
          },
          { path: 'verified-required', canActivate: [ emailVerifiedGuard ], component: TestComponent },
          { path: 'confirm-email', component: TestComponent },
        ]),
      ],
    });

    auth = TestBed.inject(Auth);
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  describe('user with verified email', (): void => {
    beforeEach(async (): Promise<void> => {
      await signInWithEmailAndPassword(auth, DEFAULT_TEST_USER.email, DEFAULT_TEST_USER.password);
    });

    it('should guard route', async (): Promise<void> => {
      await harness.navigateByUrl('/verified-required');

      expect(router.url).toBe('/verified-required');
    });

    it('should guard child routes', async (): Promise<void> => {
      await harness.navigateByUrl('/verified-required-child');

      expect(router.url).toBe('/verified-required-child');
    });
  });

  describe('user with unverified email', (): void => {
    beforeEach(async (): Promise<void> => {
      await signInWithEmailAndPassword(auth, UNVERIFIED_TEST_USER.email, UNVERIFIED_TEST_USER.password);
    });

    it('should guard route', async (): Promise<void> => {
      await harness.navigateByUrl('/verified-required');

      expect(router.url).toBe('/confirm-email?next=%2Fverified-required');
    });

    it('should guard child routes', async (): Promise<void> => {
      await harness.navigateByUrl('/verified-required-child');

      expect(router.url).toBe('/confirm-email?next=%2Fverified-required-child');
    });
  });

  describe('logged out user', (): void => {
    beforeEach(async (): Promise<void> => {
      await signOut(auth);
    });

    it('should prevent navigation', async (): Promise<void> => {
      await harness.navigateByUrl('/verified-required');
      const { lastSuccessfulNavigation, url } = router;

      expect(url).toBe('/');
      expect(lastSuccessfulNavigation).toBeNull();
    });
  });
});
