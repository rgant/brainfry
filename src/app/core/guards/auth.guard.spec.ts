import { TestBed } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideOurFirebaseApp } from '~/app/core/firebase-app.provider';
import { DEFAULT_TEST_USER } from '~/testing/constants';
import { TestComponent } from '~/testing/test.component';
import { provideEmulatedAuth } from '~/testing/utilities';

import { authGuard } from './auth.guard';

describe('authGuard', (): void => {
  let auth: Auth;
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async (): Promise<void> => {
    TestBed.configureTestingModule({
      providers: [
        provideOurFirebaseApp(),
        provideEmulatedAuth(),
        provideRouter([
          { path: '', canActivateChild: [ authGuard ], children: [ { path: 'login-required-child', component: TestComponent } ] },
          { path: 'login-required', canActivate: [ authGuard ], component: TestComponent },
          { path: 'login', component: TestComponent },
        ]),
      ],
    });

    auth = TestBed.inject(Auth);
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  describe('logged in user', (): void => {
    afterEach(async (): Promise<void> => {
      // Prevent cross test pollution because it seems users can remain logged in across tests.
      await signOut(auth);
    });

    beforeEach(async (): Promise<void> => {
      await signInWithEmailAndPassword(auth, DEFAULT_TEST_USER.email, DEFAULT_TEST_USER.password);
    });

    it('should guard route', async (): Promise<void> => {
      await harness.navigateByUrl('/login-required');

      expect(router.url).toBe('/login-required');
    });

    it('should guard child routes', async (): Promise<void> => {
      await harness.navigateByUrl('/login-required-child');

      expect(router.url).toBe('/login-required-child');
    });
  });

  describe('logged out user', (): void => {
    beforeEach(async (): Promise<void> => {
      await signOut(auth);
    });

    it('should guard route', async (): Promise<void> => {
      await harness.navigateByUrl('/login-required');

      expect(router.url).toBe('/login?next=%2Flogin-required');
    });

    it('should guard child routes', async (): Promise<void> => {
      await harness.navigateByUrl('/login-required-child');

      expect(router.url).toBe('/login?next=%2Flogin-required-child');
    });
  });
});
