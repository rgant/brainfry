import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';

import type { PromiseResolver } from '~/testing/promise-methods';
import { getCompiled, safeQuerySelector } from '~/testing/utilities';

import { createMockNavigation } from '../testing/create-mock-navigation.spec';
import { VerifyEmailComponent } from './verify-email.component';
import { VerifyEmailService } from './verify-email.service';
import type { VerifyEmailResult } from './verify-email.service';

describe('VerifyEmailComponent', (): void => {
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let getCurrentNavigationSpy: jasmine.Spy;
  let verifyEmailSpy: jasmine.Spy;
  let router: Router;
  let resolveVerifyEmail: PromiseResolver<VerifyEmailResult>;

  const setupFixture = (oobCode: string, continueUrl?: string): void => {
    getCurrentNavigationSpy.and.returnValue(createMockNavigation({ continueUrl, oobCode }));
    fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();
  };
  const setupMockService = (): jasmine.SpyObj<VerifyEmailService> => {
    // eslint-disable-next-line jasmine/no-unsafe-spy -- method is called in beforeEach
    const mockService = jasmine.createSpyObj<VerifyEmailService>('VerifyEmailService', [ 'verifyEmail' ]);
    const verifyPromise = new Promise<VerifyEmailResult>((resolve: PromiseResolver<VerifyEmailResult>): void => {
      resolveVerifyEmail = resolve;
    });

    verifyEmailSpy = mockService.verifyEmail.and.returnValue(verifyPromise);

    return mockService;
  };

  beforeEach(async (): Promise<void> => {
    const mockService = setupMockService();

    await TestBed.configureTestingModule({
      imports: [ VerifyEmailComponent ],
      providers: [
        { provide: VerifyEmailService, useValue: mockService },
        provideRouter([]),
      ],
    })
      .compileComponents();

    router = TestBed.inject(Router);
    getCurrentNavigationSpy = spyOn(router, 'getCurrentNavigation');
    // Cannot call createComponent until the getCurrentNavigationSpy return is setup for each test.
  });

  it('should verify email', async (): Promise<void> => {
    const expectedCode = '3e343528-ca59-4bed-9b16-38d709e8fa8c';

    setupFixture(expectedCode);
    resolveVerifyEmail({
      continueUrl: '/',
      verified: true,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(verifyEmailSpy).toHaveBeenCalledOnceWith(expectedCode, undefined);

    const compiled = getCompiled(fixture);

    expect(safeQuerySelector(compiled, 'h2').textContent).withContext('h2 header').toContain('Your email has been verified!');

    const lnkDe = fixture.debugElement.query(By.directive(RouterLink));
    const routerLink = lnkDe.injector.get(RouterLink);

    expect(routerLink.href).toBe('/');
  });

  it('should use continueUrl', async (): Promise<void> => {
    const expectedCode = '3e343528-ca59-4bed-9b16-38d709e8fa8c';
    const expectedUrl = '/quizzes/1';

    setupFixture(expectedCode, expectedUrl);
    resolveVerifyEmail({
      continueUrl: expectedUrl,
      verified: true,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(verifyEmailSpy).toHaveBeenCalledOnceWith(expectedCode, expectedUrl);

    const lnkDe = fixture.debugElement.query(By.directive(RouterLink));
    const routerLink = lnkDe.injector.get(RouterLink);

    expect(routerLink.href).toBe(expectedUrl);
  });

  it('should handle failure to verify', async (): Promise<void> => {
    const expectedCode = 'caf2d040-9aa2-4346-b3da-233f1f1970e7';

    setupFixture(expectedCode);
    resolveVerifyEmail({
      continueUrl: '/',
      errorCode: 'auth/invalid-action-code',
      verified: false,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(verifyEmailSpy).toHaveBeenCalledOnceWith(expectedCode, undefined);

    const compiled = getCompiled(fixture);

    expect(safeQuerySelector(compiled, 'h2').textContent)
      .withContext('h2 header')
      .toContain('There was a problem with your verification link');

    expect(safeQuerySelector(compiled, 'p.alert').textContent)
      .withContext('alert p')
      .toContain('The action code is invalid.');
  });
});
