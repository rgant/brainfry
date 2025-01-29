import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Auth, signOut } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { FORMS, PASSWORDS } from '@app/shared/constants';
import { DEFAULT_TEST_USER } from '@testing/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { emailControlTest, emailErrorMessagesTest, emailInputTest } from '../testing/email-field.spec';
import { findOobCode } from '../testing/oob-codes.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
import {
  cleanupUsers,
  createAndSignInUser,
  generateRandomEmail,
  TEST_USER_PASSWORD,
} from '../testing/test-users.spec';
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

  const testUsers: User[] = [];

  // This is really only necessary so that we don't export these users from the emulator
  afterAll(async (): Promise<void> => {
    await cleanupUsers(auth, testUsers);
  });

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
    testUsers.push(testUser);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should error when invalid form is submitted', async (): Promise<void> => {
    await expectAsync(component.onSubmit(testUser)).toBeRejectedWithError('Invalid form submitted');
  });

  it('should send change email verification message', async (): Promise<void> => {
    const newEmail = generateRandomEmail('new'); // Generate a new email address each time for multiple test runs.
    component.changeEmailForm.setValue({ email1: newEmail, email2: newEmail, password: TEST_USER_PASSWORD });

    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('unsent');
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit(testUser);

    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('sending');
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;
    const oobCode = await findOobCode(testUser.email ?? 'unknwon', 'verifyBeforeUpdateEmail');

    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('sent');
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(oobCode).withContext('oobCode for password reset email').toBeTruthy();

    // Prevent cross test pollution because it seems users can remain logged in across tests.
    await signOut(auth);
  });

  it('should handle reauthenticate errors', async (): Promise<void> => {
    const newEmail = generateRandomEmail('new'); // Generate a new email address each time for multiple test runs.
    component.changeEmailForm.setValue({ email1: newEmail, email2: newEmail, password: 'c17E5bbf9%cf' });

    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('unsent');
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit(testUser);

    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('sending');
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('unsent');
    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/wrong-password');

    // Prevent cross test pollution because it seems users can remain logged in across tests.
    await signOut(auth);
  });

  it('should handle update email errors', async (): Promise<void> => {
    const newEmail = DEFAULT_TEST_USER.email;
    component.changeEmailForm.setValue({ email1: newEmail, email2: newEmail, password: TEST_USER_PASSWORD });

    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('unsent');
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.onSubmit(testUser);

    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('sending');
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('unsent');
    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/email-already-in-use');

    // Prevent cross test pollution because it seems users can remain logged in across tests.
    await signOut(auth);
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

  it('should display spinner while waiting for user', async (): Promise<void> => {
    // This test is being done in reverse with the signed in state before the signed out spinner
    // because of how the test state is setup.
    const compiled = getCompiled(fixture);

    expect(compiled.querySelector('.main-card app-spinner')).withContext('.main-card app-spinner').toBeNull();
    expect(compiled.querySelector('form')).withContext('form').toBeTruthy();

    await signOut(auth);
    await firstValueFrom(component.user$); // Wait for the Observable to recognize that we have logged out.
    fixture.detectChanges();

    expect(compiled.querySelector('.main-card app-spinner')).withContext('.main-card app-spinner').toBeTruthy();
    expect(compiled.querySelector('form')).withContext('form').toBeNull();
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

  it('should configure change email FormGroup', fakeAsync((): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.changeEmailForm.value).withContext('value').toEqual({ email1: null, email2: null, password: null });
    expect(component.changeEmailForm.invalid).withContext('invalid').toBeTrue();

    // Emails Mismatch
    component.changeEmailForm.setValue({ email1: '97cd@417d.83e7', email2: 'e477@4004.848b', password: 'b878b2626482067b4910' });
    tick(FORMS.inputDebounce);

    expect(component.changeEmailForm.invalid).withContext('invalid').toBeTrue();
    expect(component.$formEmailsInvalid()).withContext('$formEmailsInvalid').toBeTrue();

    // Valid
    component.changeEmailForm.setValue({ email1: '464f@bf86.6c3901f06536', email2: '464f@bf86.6c3901f06536', password: 'e1bf3aff-03bd' });

    expect(component.changeEmailForm.valid).withContext('valid').toBeTrue();
  }));

  it('should display password match form errors', fakeAsync((): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const frmErrsEl: HTMLDivElement = safeQuerySelector(compiled, '#frm-msgs');

    expect(frmErrsEl.querySelector('.form-alerts')).withContext('.form-alert').toBeNull();

    component.changeEmailForm.setValue({ email1: '4878@4662.b551', email2: '7621@42e3.873b', password: 'e6eA3$4f134a' });
    tick(FORMS.inputDebounce);
    fixture.detectChanges();

    expect(frmErrsEl.textContent).toContain('Emails must match.');
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

  it('should display spinner while sending state', (): void => {
    const compiled = getCompiled(fixture);

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeNull();
    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeTruthy();

    component.$verificationStatus.set('sending');
    fixture.detectChanges();

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeTruthy();
    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeNull();
  });

  it('should display sucess message', (): void => {
    component.changeEmailForm.setValue({ email1: '7f89@47d3.8c5b', email2: '7f89@47d3.8c5b', password: 'd738a198-13839d04e1F8' });
    component.$verificationStatus.set('sent');
    fixture.detectChanges();

    const compiled = getCompiled(fixture);

    expect(safeQuerySelector(compiled, 'p').textContent).withContext('p').toContain('click the link in the email sent to 7f89@47d3.8c5b.');
  });
});
