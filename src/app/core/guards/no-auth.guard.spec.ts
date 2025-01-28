import { TestBed } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { DEFAULT_TEST_USER } from '@testing/constants';
import { TestComponent } from '@testing/test.component';
import { provideEmulatedAuth } from '@testing/utilities';

import { noAuthGuard } from './no-auth.guard';

describe('noAuthGuard', (): void => {
  let auth: Auth;
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async (): Promise<void> => {
    TestBed.configureTestingModule({
      providers: [
        provideOurFirebaseApp(),
        provideEmulatedAuth(),
        provideRouter([
          { path: '', canActivateChild: [ noAuthGuard ], children: [ { path: 'unauthenticated-child', component: TestComponent } ] },
          { path: 'unauthenticated', canActivate: [ noAuthGuard ], component: TestComponent },
          { path: 'dashboard', component: TestComponent },
          { path: '', component: TestComponent },
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
      await harness.navigateByUrl('/unauthenticated');

      expect(router.url).toBe('/');
    });

    it('should guard child routes', async (): Promise<void> => {
      await harness.navigateByUrl('/unauthenticated-child');

      expect(router.url).toBe('/');
    });

    it('should navigate to next query parameter', async (): Promise<void> => {
      await harness.navigateByUrl('/unauthenticated?next=%2Fdashboard');

      expect(router.url).toBe('/dashboard');
    });
  });

  describe('logged out user', (): void => {
    beforeEach(async (): Promise<void> => {
      await signOut(auth);
    });

    it('should guard route', async (): Promise<void> => {
      await harness.navigateByUrl('/unauthenticated');

      expect(router.url).toBe('/unauthenticated');
    });

    it('should guard child routes', async (): Promise<void> => {
      await harness.navigateByUrl('/unauthenticated-child');

      expect(router.url).toBe('/unauthenticated-child');
    });
  });
});
