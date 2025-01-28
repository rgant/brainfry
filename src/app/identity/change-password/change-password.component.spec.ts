import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { FORMS, PASSWORDS } from '@app/shared/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
import { createAndSignInUser, TEST_USER_PASSWORD } from '../testing/test-users.spec';
import { ChangePasswordComponent } from './change-password.component';

const passwordFields = [
  {
    autoComplete: 'current-password',
    control: 'currentPwCntrl',
    errorId: 'fld-currentPw-msgs',
    inputId: 'fld-currentPw',
    validateStrength: false,
  },
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

describe('ChangePasswordComponent', (): void => {
  let auth: Auth;
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let testUser: User;

  const passwordFieldTests = ({ autoComplete, control, errorId, inputId, validateStrength }: FieldSetup): void => {
    it(`should configure current ${control} FormControl`, fakeAsync((): void => {
      const cntrl = component[control];
      passwordControlTest(cntrl, validateStrength);
    }));

    it(`should configure ${control} input`, (): void => {
      passwordInputTest(fixture, inputId, autoComplete);
    });

    it(`should set ${control} input aria-invalid attribute`, (): void => {
      const cntrl = component[control];
      ariaInvalidTest(cntrl, fixture, inputId);
    });

    it(`should configure ${control} error messages`, fakeAsync((): void => {
      const cntrl = component[control];
      passwordErrorMessagesTest(cntrl, fixture, { errorsId: errorId, isNewPassword: validateStrength });
    }));
  };

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ ChangePasswordComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth() ],
    })
      .compileComponents();

    auth = TestBed.inject(Auth);

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    testUser = await createAndSignInUser(auth);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should have password constraints', (): void => {
    expect(component.maxPasswordLength).withContext('maxPasswordLength').toBe(PASSWORDS.maxLength);
    expect(component.minPasswordLength).withContext('minPasswordLength').toBe(PASSWORDS.minLength);
  });

  it('should error when invalid form is submitted', async (): Promise<void> => {
    await expectAsync(component.onSubmit(testUser)).toBeRejectedWithError('Invalid form submitted');
  });

  it('should update password', async (): Promise<void> => {
    interface ReloadUserInfo { reloadUserInfo: { lastLoginAt: number; passwordUpdatedAt: number } }
    // @ts-expect-error accessing private property for testing reauthenticateWithCredential
    const { reloadUserInfo: { lastLoginAt: beforelastLoginAt, passwordUpdatedAt: beforePasswordUpdatedAt } }: ReloadUserInfo = testUser;
    const newPassword = '6e23265)76F9';
    component.changePasswordForm.setValue({ currentPw: TEST_USER_PASSWORD, password1: newPassword, password2: newPassword });

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;
    // @ts-expect-error accessing private property for testing reauthenticateWithCredential
    const { reloadUserInfo: { lastLoginAt: afterlastLoginAt, passwordUpdatedAt: afterPasswordUpdatedAt } }: ReloadUserInfo = testUser;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(afterlastLoginAt).withContext('user.lastLoginAt').toBeGreaterThan(beforelastLoginAt);
    expect(afterPasswordUpdatedAt).withContext('user.passwordUpdatedAt').toBeGreaterThan(beforePasswordUpdatedAt);
  });

  it('should handle reauthenticate errors', async (): Promise<void> => {
    const newPassword = '51df0a3b5F@b';
    component.changePasswordForm.setValue({ currentPw: 'f73e403e-49AF4e11', password1: newPassword, password2: newPassword });

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/wrong-password');
  });

  it('should handle update email errors', async (): Promise<void> => {
    const newPassword = 'abd2'; // Must be less than the default password policy becaues the emulator doesn't use our policy.
    component.changePasswordForm.setValue({ currentPw: TEST_USER_PASSWORD, password1: newPassword, password2: newPassword });
    // Override the field validation to force an error submit.
    component.password1Cntrl.setErrors(null); // eslint-disable-line unicorn/no-null -- ValidationErrors use null
    component.password2Cntrl.setErrors(null); // eslint-disable-line unicorn/no-null -- ValidationErrors use null

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/weak-password');
  });

  for (const setup of passwordFields) {
    passwordFieldTests(setup);
  }

  it('should configure change password FormGroup', fakeAsync((): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.changePasswordForm.value).withContext('value').toEqual({ currentPw: null, password1: null, password2: null });
    expect(component.changePasswordForm.invalid).withContext('invalid').toBeTrue();

    // Password Mismatch
    component.changePasswordForm.setValue({ currentPw: 'a8c2ba38-8ec8', password1: '4d6B-887%-52', password2: 'a3b9d49420f7' });
    tick(FORMS.inputDebounce);

    expect(component.changePasswordForm.invalid).withContext('invalid').toBeTrue();
    expect(component.$formPasswordsInvalid()).withContext('$formPasswordsInvalid').toBeTrue();

    // Valid
    component.changePasswordForm.setValue({ currentPw: 'b1851b66-191', password1: '3bBce4%2c731', password2: '3bBce4%2c731' });
    tick(); // Firebase validatePassword is async

    expect(component.changePasswordForm.valid).withContext('valid').toBeTrue();
  }));

  it('should display password match form errors', fakeAsync((): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const frmErrsEl: HTMLDivElement = safeQuerySelector(compiled, '#frm-msgs');

    expect(frmErrsEl.querySelector('.form-alerts')).withContext('.form-alert').toBeNull();

    component.changePasswordForm.setValue({ currentPw: '188f1dff-7dc', password1: 'c-41E3-81e4-', password2: '7c19a13bdd5f' });
    tick(FORMS.inputDebounce);
    fixture.detectChanges();

    expect(frmErrsEl.textContent).toContain('Passwords must match.');
  }));

  it('should display submit errors', (): void => {
    component.$errorCode.set('auth/wrong-password');
    fixture.detectChanges();

    const compiled = getCompiled(fixture);

    expect(safeQuerySelector(compiled, '.alert').textContent).toContain('The password is invalid or the user does not have a password.');
  });

  it('should configure submit button', (): void => {
    const submitSpy = spyOn(component, 'onSubmit');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');

    expect(bttnEl.disabled).withContext('disabled').toBeTrue();

    component.changePasswordForm.setValue({ currentPw: '9492906e-492', password1: '9d*Aef795f75', password2: '9d*Aef795f75' });
    fixture.detectChanges();

    expect(component.changePasswordForm.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBeFalse();

    bttnEl.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
