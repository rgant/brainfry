import { TestBed } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import {
  ActivatedRoute,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import type { GuardResult, MaybeAsync } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { firstValueFrom, Observable } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { DEFAULT_TEST_USER, UNVERIFIED_TEST_USER } from '@testing/constants';
import { provideEmulatedAuth } from '@testing/helpers';
import { TestComponent } from '@testing/test.component';

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
          { path: 'verified-not-required', component: TestComponent },
          { path: 'confirm-email', component: TestComponent },
        ]),
        { provide: RouterStateSnapshot, useValue: { url: '/' } },
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

    it('should ignore unguarded routes', async (): Promise<void> => {
      await harness.navigateByUrl('/verified-not-required');

      expect(router.url).toBe('/verified-not-required');
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

    it('should ignore unguarded routes', async (): Promise<void> => {
      await harness.navigateByUrl('/verified-not-required');

      expect(router.url).toBe('/verified-not-required');
    });
  });

  describe('logged out user', (): void => {
    beforeEach(async (): Promise<void> => {
      await signOut(auth);
    });

    it('should error without user', async (): Promise<void> => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      const routerStateSnapshot = TestBed.inject(RouterStateSnapshot);

      const guard$ = TestBed.runInInjectionContext(
        (): MaybeAsync<GuardResult> => emailVerifiedGuard(activatedRoute.snapshot, routerStateSnapshot),
      );
      if (guard$ instanceof Observable) {
        await expectAsync(firstValueFrom(guard$)).toBeRejectedWithError('Cannot verify email without logged in user!');
      } else {
        fail('Guard failed to return Observable');
      }
    });

    it('should ignore unguarded routes', async (): Promise<void> => {
      await harness.navigateByUrl('/verified-not-required');

      expect(router.url).toBe('/verified-not-required');
    });
  });
});
