import { fakeAsync, TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { DEFAULT_TEST_USER } from '@testing/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { emailControlTest, emailErrorMessagesTest, emailInputTest } from '../testing/email-field.spec';
import { findOobCode } from '../testing/oob-codes.spec';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', (): void => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ ForgotPasswordComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth(), provideRouter([]) ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should error when invalid form is submitted', async (): Promise<void> => {
    await expectAsync(component.onSubmit()).toBeRejectedWithError('Invalid form submitted');
  });

  it('should send password reset email', async (): Promise<void> => {
    component.forgotForm.setValue({ email: DEFAULT_TEST_USER.email });

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit();

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;
    const oobCode = await findOobCode(DEFAULT_TEST_USER.email, 'sendPasswordResetEmail');

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(oobCode).withContext('oobCode for password reset email').toBeTruthy();
  });

  it('should handle send email errors', async (): Promise<void> => {
    component.forgotForm.setValue({ email: '58de@4e2a.8181' });

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit();

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    // This error is only thrown because the emulator isn't setup to enable enumerated email protection.
    // https://firebase.google.com/docs/reference/js/auth.md#sendpasswordresetemail_95b079b
    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/user-not-found');
  });

  it('should configure email FormControl', (): void => {
    emailControlTest(component.emailCntrl);
  });

  it('should configure email input', (): void => {
    emailInputTest(fixture, 'fld-email');
  });

  it('should set email input aria-invalid attribute', (): void => {
    ariaInvalidTest(component.emailCntrl, fixture, 'fld-email');
  });

  it('should configure email error messages', fakeAsync((): void => {
    emailErrorMessagesTest(component.emailCntrl, fixture, 'fld-email-msgs');
  }));

  it('should configure reset password FormGroup', (): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.forgotForm.value).withContext('value').toEqual({ email: null });
    expect(component.forgotForm.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.forgotForm.setValue({ email: 'c817@49ad.ac20' });

    expect(component.forgotForm.valid).withContext('valid').toBeTrue();
  });

  it('should configure submit button', (): void => {
    const submitSpy = spyOn(component, 'onSubmit');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');

    expect(bttnEl.disabled).withContext('disabled').toBeTrue();

    component.emailCntrl.setValue('6783@4086.890b');
    fixture.detectChanges();

    expect(component.emailCntrl.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBeFalse();

    bttnEl.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
