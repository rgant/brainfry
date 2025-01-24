import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { TestComponent } from '@testing/test.component';

import { ActionsComponent } from './actions.component';
import type { ActionCodeState } from './actions.component';

describe('ActionsComponent', (): void => {
  let consoleSpy: jasmine.Spy;
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'actions', component: ActionsComponent },
            { path: 'recover-email', component: TestComponent },
            { path: 'reset-password', component: TestComponent },
            { path: 'verify-email', component: TestComponent },
            { path: '', pathMatch: 'full', component: TestComponent },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .compileComponents();

    consoleSpy = spyOn(console, 'error');
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  it('should handle recoverEmail action', async (): Promise<void> => {
    const expectedState: ActionCodeState = {
      continueUrl: undefined,
      lang: undefined,
      mode: 'recoverEmail',
      oobCode: 'ABC123',
    };

    await harness.navigateByUrl('/actions?mode=recoverEmail&oobCode=ABC123');
    const { lastSuccessfulNavigation, url } = router;

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(url).toBe('/recover-email');
    expect(lastSuccessfulNavigation?.extras.replaceUrl).withContext('replaceUrl').toBeTrue();
    expect(lastSuccessfulNavigation?.extras.state).withContext('Route State').toEqual(expectedState);
  });

  it('should handle resetPassword action', async (): Promise<void> => {
    const expectedState: ActionCodeState = {
      continueUrl: undefined,
      lang: undefined,
      mode: 'resetPassword',
      oobCode: 'ABC123',
    };

    await harness.navigateByUrl('/actions?mode=resetPassword&oobCode=ABC123');
    const { lastSuccessfulNavigation, url } = router;

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(url).toBe('/reset-password');
    expect(lastSuccessfulNavigation?.extras.replaceUrl).withContext('replaceUrl').toBeTrue();
    expect(lastSuccessfulNavigation?.extras.state).withContext('Route State').toEqual(expectedState);
  });

  it('should handle verifyEmail action', async (): Promise<void> => {
    const expectedState: ActionCodeState = {
      continueUrl: undefined,
      lang: undefined,
      mode: 'verifyEmail',
      oobCode: 'ABC123',
    };

    await harness.navigateByUrl('/actions?mode=verifyEmail&oobCode=ABC123');
    const { lastSuccessfulNavigation, url } = router;

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(url).toBe('/verify-email');
    expect(lastSuccessfulNavigation?.extras.replaceUrl).withContext('replaceUrl').toBeTrue();
    expect(lastSuccessfulNavigation?.extras.state).withContext('Route State').toEqual(expectedState);
  });

  it('should add continueUrl to state', async (): Promise<void> => {
    const expectedState: ActionCodeState = {
      continueUrl: '/login',
      lang: undefined,
      mode: 'verifyEmail',
      oobCode: 'ABC123',
    };

    await harness.navigateByUrl('/actions?mode=verifyEmail&oobCode=ABC123&continueUrl=%2Flogin');
    const { lastSuccessfulNavigation, url } = router;

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(url).toBe('/verify-email');
    expect(lastSuccessfulNavigation?.extras.replaceUrl).withContext('replaceUrl').toBeTrue();
    expect(lastSuccessfulNavigation?.extras.state).withContext('Route State').toEqual(expectedState);
  });

  it('should add lang to state', async (): Promise<void> => {
    const expectedState: ActionCodeState = {
      continueUrl: undefined,
      lang: 'fr',
      mode: 'verifyEmail',
      oobCode: 'ABC123',
    };

    await harness.navigateByUrl('/actions?mode=verifyEmail&oobCode=ABC123&lang=fr');
    const { lastSuccessfulNavigation, url } = router;

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(url).toBe('/verify-email');
    expect(lastSuccessfulNavigation?.extras.replaceUrl).withContext('replaceUrl').toBeTrue();
    expect(lastSuccessfulNavigation?.extras.state).withContext('Route State').toEqual(expectedState);
  });

  it('should handle missing mode parameter', async (): Promise<void> => {
    await harness.navigateByUrl('/actions?oobCode=ABC123');
    const { lastSuccessfulNavigation, url } = router;

    expect(consoleSpy).toHaveBeenCalledOnceWith('Missing ActionCodeSettings#mode');
    expect(url).toBe('/');
    expect(lastSuccessfulNavigation?.extras.replaceUrl).withContext('replaceUrl').toBeTrue();
  });

  it('should handle missing oobCode parameter', async (): Promise<void> => {
    await harness.navigateByUrl('/actions?mode=resetPassword');
    const { lastSuccessfulNavigation, url } = router;

    expect(consoleSpy).toHaveBeenCalledOnceWith('Missing ActionCodeSettings#oobCode');
    expect(url).toBe('/');
    expect(lastSuccessfulNavigation?.extras.replaceUrl).withContext('replaceUrl').toBeTrue();
  });

  it('should handle unknown mode parameter', async (): Promise<void> => {
    await harness.navigateByUrl('/actions?mode=unknownCode&oobCode=ABC123');
    const { lastSuccessfulNavigation, url } = router;

    expect(consoleSpy).toHaveBeenCalledOnceWith("Unknown mode 'unknownCode'");
    expect(url).toBe('/');
    expect(lastSuccessfulNavigation?.extras.replaceUrl).withContext('replaceUrl').toBeTrue();
  });
});
