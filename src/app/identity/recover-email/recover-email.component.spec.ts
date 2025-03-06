import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { getCompiled, safeQuerySelector } from '~/testing/utilities';

import { createMockNavigation } from '../testing/create-mock-navigation.spec';
import { RecoverEmailComponent } from './recover-email.component';
import { RecoverEmailService } from './recover-email.service';
import type { RecoverEmailResults } from './recover-email.service';

describe('RecoverEmailComponent', (): void => {
  let fixture: ComponentFixture<RecoverEmailComponent>;
  let getCurrentNavigationSpy: jasmine.Spy;
  let recoverEmailSpy: jasmine.Spy;
  let router: Router;

  const setupFixture = (oobCode: string): void => {
    getCurrentNavigationSpy.and.returnValue(createMockNavigation({ oobCode }));
    fixture = TestBed.createComponent(RecoverEmailComponent);
    fixture.detectChanges();
  };
  const viewModelSubject$ = new Subject<RecoverEmailResults>();

  beforeEach(async (): Promise<void> => {
    const mockService = jasmine.createSpyObj<RecoverEmailService>('RecoverEmailService', [ 'recoverEmail$' ]);
    recoverEmailSpy = mockService.recoverEmail$.and.returnValue(viewModelSubject$);

    await TestBed.configureTestingModule({
      imports: [ RecoverEmailComponent ],
      providers: [
        { provide: RecoverEmailService, useValue: mockService },
        provideRouter([]),
      ],
    })
      .compileComponents();

    router = TestBed.inject(Router);
    getCurrentNavigationSpy = spyOn(router, 'getCurrentNavigation');
    // Cannot call createComponent until the getCurrentNavigationSpy return is setup for each test.
  });

  it('should successfully recover email', (): void => {
    const expectedCode = '4ae6cbd3-2e70-48da-9267-a6940d26854a';
    const expectedEmail = 'ca82@4c53.a7e2';

    setupFixture(expectedCode);

    expect(recoverEmailSpy).toHaveBeenCalledOnceWith(expectedCode);

    const compiled = getCompiled(fixture);

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeTruthy();

    viewModelSubject$.next({
      passwordResetSent: true,
      restoredEmail: expectedEmail,
      successful: true,
    });
    fixture.detectChanges();

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeNull();
    expect(safeQuerySelector(compiled, 'h2').textContent).withContext('h2 header').toContain('Your email has been restored!');
    expect(safeQuerySelector(compiled, 'p').textContent)
      .withContext('first p')
      .toContain(`Your email has been restored to ${expectedEmail}.`);

    expect(safeQuerySelector(compiled, 'p:nth-of-type(2)').textContent)
      .withContext('second p')
      .toContain('Additionally we have sent you a link to reset your password');

    expect(compiled.querySelector('.alert')).withContext('.alert').toBeNull();
  });

  it('should handle missing restoredEmail', (): void => {
    const expectedCode = '20617098-bb1a-4782-98ff-0f86ea182af0';
    const expectedEmail = '4f5c@4794.9642';

    setupFixture(expectedCode);

    viewModelSubject$.next({
      passwordResetSent: true,
      restoredEmail: undefined,
      successful: true,
    });
    fixture.detectChanges();

    const compiled = getCompiled(fixture);

    expect(compiled.textContent).withContext('component template').not.toContain(expectedEmail);
    expect(safeQuerySelector(compiled, 'p').textContent)
      .withContext('first p')
      .toContain('Additionally we have sent you a link to reset your password');
  });

  it('should handle failed password reset', (): void => {
    const expectedCode = '622a8967-b356-4716-a6d9-adee1d5a21b6';
    const expectedEmail = '40b3@4d05.a5ae';

    setupFixture(expectedCode);

    viewModelSubject$.next({
      passwordResetSent: false,
      restoredEmail: undefined,
      successful: true,
    });
    fixture.detectChanges();

    const compiled = getCompiled(fixture);

    expect(compiled.textContent).withContext('component template').not.toContain(expectedEmail);
    expect(safeQuerySelector(compiled, 'p').textContent)
      .withContext('first p')
      .toContain('In the event your account was compromised, please');
  });

  it('should handle failure to restore email', (): void => {
    const expectedCode = '2ba1c46f-a9f4-4122-b9a6-a0c5545ab868';

    setupFixture(expectedCode);

    expect(recoverEmailSpy).toHaveBeenCalledOnceWith(expectedCode);

    const compiled = getCompiled(fixture);

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeTruthy();

    viewModelSubject$.next({
      errorCode: 'auth/expired-action-code',
      passwordResetSent: false,
      restoredEmail: undefined,
      successful: false,
    });
    fixture.detectChanges();

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeNull();
    expect(safeQuerySelector(compiled, 'h2').textContent)
      .withContext('h2 header')
      .toContain('There was a problem with your restoration link');

    expect(safeQuerySelector(compiled, 'p.alert').textContent)
      .withContext('alert p')
      .toContain('The action code has expired.');
  });
});
