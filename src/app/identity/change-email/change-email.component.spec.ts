import { fakeAsync, TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { DEFAULT_TEST_USER } from '@testing/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { PASSWORDS } from '../identity-forms';
import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { emailControlTest, emailErrorMessagesTest, emailInputTest } from '../testing/email-field.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
import { createAndSignInUser, generateRandomEmail, TEST_USER_PASSWORD } from '../testing/test-users.spec';
import { ChangeEmailComponent } from './change-email.component';

const emailFields = [
  {
    control: 'email1Cntrl',
    errorId: 'fld-newEmail1-msgs',
    inputId: 'fld-newEmail1',
  },
  {
    control: 'email2Cntrl',
    errorId: 'fld-newEmail2-msgs',
    inputId: 'fld-newEmail2',
  },
] as const;

type FieldSetup = typeof emailFields[number];

describe('ChangeEmailComponent', (): void => {
  let auth: Auth;
  let component: ChangeEmailComponent;
  let fixture: ComponentFixture<ChangeEmailComponent>;
  let testUser: User;

  const emailFieldTests = ({ control, errorId, inputId }: FieldSetup): void => {
    it(`should configure ${control} FormControl`, (): void => {
      const cntrl = component[control];
      emailControlTest(cntrl);
    });

    it(`should configure ${control} input`, (): void => {
      emailInputTest(fixture, inputId);
    });

    it(`should set ${control} input aria-invalid attribute`, (): void => {
      const cntrl = component[control];
      ariaInvalidTest(cntrl, fixture, inputId);
    });

    it(`should configure ${control} error messages`, fakeAsync((): void => {
      const cntrl = component[control];
      emailErrorMessagesTest(cntrl, fixture, errorId);
    }));
  };

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ ChangeEmailComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth() ],
    })
      .compileComponents();

    auth = TestBed.inject(Auth);

    fixture = TestBed.createComponent(ChangeEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    testUser = await createAndSignInUser(auth);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should error when invalid form is submitted', async (): Promise<void> => {
    await expectAsync(component.onSubmit(testUser)).toBeRejectedWithError('Invalid form submitted');
  });

  it('should update email', async (): Promise<void> => {
    const newEmail = generateRandomEmail('new'); // Generate a new email address each time for multiple test runs.
    component.changeEmailForm.setValue({ email1: newEmail, email2: newEmail, password: TEST_USER_PASSWORD });

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
  });

  it('should handle reauthenticate errors', async (): Promise<void> => {
    const newEmail = generateRandomEmail('new'); // Generate a new email address each time for multiple test runs.
    component.changeEmailForm.setValue({ email1: newEmail, email2: newEmail, password: 'c17E5bbf9%cf' });

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
    const newEmail = DEFAULT_TEST_USER.email;
    component.changeEmailForm.setValue({ email1: newEmail, email2: newEmail, password: TEST_USER_PASSWORD });

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/email-already-in-use');
  });

  it('should display current email', (): void => {
    const compiled = getCompiled(fixture);
    const oldEmailEl: HTMLParagraphElement = safeQuerySelector(compiled, '.form-control');
    const { email } = testUser;

    if (!email) {
      throw new Error('Test user missing email');
    }

    expect(safeQuerySelector(oldEmailEl, 'label').textContent).toContain('Current email');
    expect(safeQuerySelector<HTMLInputElement>(oldEmailEl, 'input').value).toContain(email);
  });

  for (const setup of emailFields) {
    emailFieldTests(setup);
  }

  it('should configure password FormControl', (): void => {
    expect(component.maxPasswordLength).withContext('maxPasswordLength').toBe(PASSWORDS.maxLength);
    expect(component.minPasswordLength).withContext('minPasswordLength').toBe(PASSWORDS.minLength);

    passwordControlTest(component.passwordCntrl);
  });

  it('should configure password input', (): void => {
    passwordInputTest(fixture, 'fld-password', 'current-password');
  });

  it('should set password input aria-invalid attribute', (): void => {
    ariaInvalidTest(component.passwordCntrl, fixture, 'fld-password');
  });

  it('should configure password error messages', fakeAsync((): void => {
    passwordErrorMessagesTest(component.passwordCntrl, fixture, { errorsId: 'fld-password-msgs' });
  }));

  it('should configure login FormGroup', (): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.changeEmailForm.value).withContext('value').toEqual({ email1: null, email2: null, password: null });
    expect(component.changeEmailForm.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.changeEmailForm.setValue({ email1: '464f@bf86.6c3901f06536', email2: '464f@bf86.6c3901f06536', password: 'e1bf3aff-03bd' });

    expect(component.changeEmailForm.valid).withContext('valid').toBeTrue();
  });

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

    component.changeEmailForm.setValue({ email1: 'ce5a@4de7.a2db', email2: 'ce5a@4de7.a2db', password: 'ec6309685851b17d146d' });
    fixture.detectChanges();

    expect(component.changeEmailForm.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBeFalse();

    bttnEl.click();

    // Probably becuase of the re-authentication `testUser` doesn't match user$.
    // Properties like `reloadUserInfo.lastLoginAt`, `reloadUserInfo.lastRefreshAt`,
    // `stsTokenManager.expirationTime`, and `metadata.lastLoginAt` all differ.
    expect(submitSpy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ uid: testUser.uid }));
  });
});
