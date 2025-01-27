import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { FORMS, PASSWORDS } from '@app/shared/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { createMockNavigation } from '../testing/create-mock-navigation.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordService } from './reset-password.service';
import type { ResetPasswordResults } from './reset-password.service';

const passwordFields = [
  {
    autoComplete: 'new-password',
    control: 'password1Cntrl',
    errorId: 'fld-password1-msgs',
    inputId: 'fld-password1',
    validateStrength: true,
  },
  {
    autoComplete: 'new-password',
    control: 'password2Cntrl',
    errorId: 'fld-password2-msgs',
    inputId: 'fld-password2',
    validateStrength: false,
  },
] as const;

type FieldSetup = typeof passwordFields[number];

describe('ResetPasswordComponent', (): void => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let getCurrentNavigationSpy: jasmine.Spy;
  let mockService: jasmine.SpyObj<ResetPasswordService>;
  let router: Router;

  const setupComponent = (oobCode: string, verifyPayload?: ResetPasswordResults): void => {
    getCurrentNavigationSpy.and.returnValue(createMockNavigation(oobCode));
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    if (verifyPayload) {
      viewModelSubject$.next(verifyPayload);
      fixture.detectChanges();
    }
  };
  const viewModelSubject$ = new Subject<ResetPasswordResults>();
  const validVerify: ResetPasswordResults = {
    email: '2870@494c.a8dc',
    showForm: true,
  };

  const passwordFieldTests = ({ autoComplete, control, errorId, inputId, validateStrength }: FieldSetup): void => {
    it(`should configure current ${control} FormControl`, fakeAsync((): void => {
      setupComponent('ff3f56c9-4ec5-489a-8442-721ba0c8f6bb', validVerify);

      const cntrl = component[control];
      passwordControlTest(cntrl, validateStrength);
    }));

    it(`should configure ${control} input`, (): void => {
      setupComponent('ff3f56c9-4ec5-489a-8442-721ba0c8f6bb', validVerify);

      passwordInputTest(fixture, inputId, autoComplete);
    });

    it(`should set ${control} input aria-invalid attribute`, (): void => {
      setupComponent('ff3f56c9-4ec5-489a-8442-721ba0c8f6bb', validVerify);

      const cntrl = component[control];
      ariaInvalidTest(cntrl, fixture, inputId);
    });

    it(`should configure ${control} error messages`, fakeAsync((): void => {
      setupComponent('ff3f56c9-4ec5-489a-8442-721ba0c8f6bb', validVerify);

      const cntrl = component[control];
      passwordErrorMessagesTest(cntrl, fixture, { errorsId: errorId, isNewPassword: validateStrength });
    }));
  };

  beforeEach(async (): Promise<void> => {
    mockService = jasmine.createSpyObj<ResetPasswordService>([ 'replacePassword', 'resetPassword$' ]);
    mockService.resetPassword$.and.returnValue(viewModelSubject$);

    await TestBed.configureTestingModule({
      imports: [ ResetPasswordComponent ],
      providers: [
        provideOurFirebaseApp(),
        provideEmulatedAuth(), // passwordFirebaseValidator uses Auth
        { provide: ResetPasswordService, useValue: mockService },
        provideRouter([]),
      ],
      teardown: { destroyAfterEach: false },
    })
      .compileComponents();

    router = TestBed.inject(Router);
    getCurrentNavigationSpy = spyOn(router, 'getCurrentNavigation');
    // Cannot call createComponent until the getCurrentNavigationSpy return is setup for each test.
  });

  it('should have password constraints', (): void => {
    setupComponent('ff3f56c9-4ec5-489a-8442-721ba0c8f6bb', validVerify);

    expect(component.maxPasswordLength).withContext('maxPasswordLength').toBe(PASSWORDS.maxLength);
    expect(component.minPasswordLength).withContext('minPasswordLength').toBe(PASSWORDS.minLength);
  });

  it('should display loading spinner', (): void => {
    const expectedCode = '6e9eb857-12f3-4161-983f-44d72caad89a';

    // Don't let the Observable emit yet.
    setupComponent(expectedCode, undefined);

    const compiled: HTMLElement = getCompiled(fixture);

    expect(mockService.resetPassword$).withContext('service.resetPassword$').toHaveBeenCalledOnceWith(expectedCode);
    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeTruthy();
    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeNull();

    viewModelSubject$.next(validVerify);
    fixture.detectChanges();

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeNull();
    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeTruthy();
  });

  it('should handle invalid action code', (): void => {
    const expectedCode = '6e9eb857-12f3-4161-983f-44d72caad89a';
    const mockVerifyError: ResetPasswordResults = {
      email: undefined,
      errorCode: 'auth/invalid-action-code',
      showForm: false,
    };

    setupComponent(expectedCode, mockVerifyError);

    const compiled: HTMLElement = getCompiled(fixture);
    const headingEl: HTMLHeadingElement = safeQuerySelector(compiled, 'h2');

    expect(headingEl.textContent).toContain('There was a problem with your reset link');

    const alertEl: HTMLParagraphElement = safeQuerySelector(compiled, '.alert');

    expect(alertEl.textContent).toContain('The action code is invalid.');
  });

  for (const setup of passwordFields) {
    passwordFieldTests(setup);
  }

  it('should configure change password FormGroup', fakeAsync((): void => {
    setupComponent('ff3f56c9-4ec5-489a-8442-721ba0c8f6bb', validVerify);

    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.resetPasswordForm.value).withContext('value').toEqual({ password1: null, password2: null });
    expect(component.resetPasswordForm.invalid).withContext('invalid').toBeTrue();

    // Password Mismatch
    component.resetPasswordForm.setValue({ password1: '571^e3c0-6Ed4-46f9', password2: 'b4ed-9c249d447ef7' });
    tick(FORMS.inputDebounce);

    expect(component.resetPasswordForm.invalid).withContext('invalid').toBeTrue();
    expect(component.$formPasswordsInvalid()).withContext('$formPasswordsInvalid').toBeTrue();

    // Valid
    component.resetPasswordForm.setValue({ password1: '68*0164eC676', password2: '68*0164eC676' });
    tick(FORMS.inputDebounce);

    expect(component.resetPasswordForm.valid).withContext('valid').toBeTrue();
    expect(component.$formPasswordsInvalid()).withContext('$formPasswordsInvalid').toBeFalse();
  }));

  it('should display password match form errors', fakeAsync((): void => {
    setupComponent('ff3f56c9-4ec5-489a-8442-721ba0c8f6bb', validVerify);

    const compiled: HTMLElement = getCompiled(fixture);
    const frmErrsEl: HTMLDivElement = safeQuerySelector(compiled, '#frm-msgs');

    expect(frmErrsEl.querySelector('.form-alerts')).withContext('.form-alert').toBeNull();

    component.resetPasswordForm.setValue({ password1: '95B07$d7-4530-43db', password2: '87f9-7e2d71c9cf03' });
    tick(FORMS.inputDebounce);
    fixture.detectChanges();

    expect(frmErrsEl.textContent).toContain('Passwords must match.');
  }));

  it('should throw error when invalid form is submitted', (): void => {
    setupComponent('5ef8f4e5-2484-48f4-b7a3-e8ee4f69b220', validVerify);

    expect((): void => { component.onSubmit(); }).toThrowError('Invalid form submitted');
    expect(mockService.replacePassword).not.toHaveBeenCalled();
  });

  it('should submit form', (): void => {
    const expectedPassword = '4823Ad9(ad9a';

    setupComponent('d8365035-cbbf-490b-96b3-72c3ebe73ff4', validVerify);
    component.resetPasswordForm.setValue({ password1: expectedPassword, password2: expectedPassword });
    fixture.detectChanges();
    component.onSubmit();

    expect(mockService.replacePassword).toHaveBeenCalledOnceWith(expectedPassword);
  });

  it('should show reset password error message', (): void => {
    const mockVerifyError: ResetPasswordResults = {
      email: 'ebee@43a5.ba23',
      errorCode: 'auth/password-does-not-meet-requirements',
      showForm: true,
    };

    setupComponent('b8344e72-c9ec-4051-af7b-3bbabab68abf', mockVerifyError);

    const compiled: HTMLElement = getCompiled(fixture);
    const paragraphEl: HTMLParagraphElement = safeQuerySelector(compiled, '#reset-description');

    expect(paragraphEl.textContent)
      .withContext('#reset-description')
      .toContain(`Replace the password for ${mockVerifyError.email} account.`);

    const alertEl: HTMLParagraphElement = safeQuerySelector(compiled, '.alert');

    expect(alertEl.textContent).withContext('.alert').toContain('The password does not meet the requirements.');
  });

  it('should configure submit button', (): void => {
    setupComponent('ff3f56c9-4ec5-489a-8442-721ba0c8f6bb', validVerify);

    const submitSpy = spyOn(component, 'onSubmit');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');

    expect(bttnEl.disabled).withContext('disabled').toBe(true);

    component.resetPasswordForm.setValue({ password1: 'e8a5&0C8f8c7', password2: 'e8a5&0C8f8c7' });
    fixture.detectChanges();

    expect(component.resetPasswordForm.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBe(false);

    bttnEl.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('should show success message', (): void => {
    const expectedCode = 'b4825609-1f3e-4605-bc98-43cc8d9d175a';
    const mockSuccess: ResetPasswordResults = {
      errorCode: undefined,
      showForm: false,
    };

    setupComponent(expectedCode, mockSuccess);

    const compiled: HTMLElement = getCompiled(fixture);
    const headingEl: HTMLHeadingElement = safeQuerySelector(compiled, 'h2');

    expect(headingEl.textContent).toContain('Your password has been replaced!');
  });
});
