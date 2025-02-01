import { fakeAsync, TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { provideRouter, Router } from '@angular/router';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { PASSWORDS } from '../identity-forms';
import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
import { cleanupUsers, createAndSignInUser, TEST_USER_PASSWORD } from '../testing/test-users.spec';
import { DeleteAccountComponent } from './delete-account.component';

describe('DeleteAccountComponent', (): void => {
  let auth: Auth;
  let component: DeleteAccountComponent;
  let fixture: ComponentFixture<DeleteAccountComponent>;
  let testUser: User;

  const testUsers: User[] = [];

  // This is really only necessary so that we don't export these users from the emulator
  afterAll(async (): Promise<void> => {
    // Remove any successfully deleted users from the list because otherwise we get auth/user-token-expired errors
    const currentUsers = testUsers.filter((user: User): boolean => user.refreshToken !== '');
    await cleanupUsers(auth, currentUsers);
  });

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ DeleteAccountComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth(), provideRouter([]) ],
    })
      .compileComponents();

    auth = TestBed.inject(Auth);

    fixture = TestBed.createComponent(DeleteAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    testUser = await createAndSignInUser(auth);
    testUsers.push(testUser);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should open and close dialog', (): void => {
    const compiled = getCompiled(fixture);
    const dialogEl: HTMLDialogElement = safeQuerySelector(compiled, 'dialog');

    expect(dialogEl.hasAttribute('open')).withContext('dialog#open').toBeFalse();

    component.openDialog();
    fixture.detectChanges();

    expect(dialogEl.hasAttribute('open')).withContext('dialog#open').toBeTrue();

    component.closeDialog();
    fixture.detectChanges();

    expect(dialogEl.hasAttribute('open')).withContext('dialog#open').toBeFalse();
  });

  it('should clear error code when opening dialog', (): void => {
    component.$errorCode.set('test error');
    component.openDialog();
    fixture.detectChanges();

    expect(component.$errorCode()).withContext('$errorCode').toBe('');
  });

  it('should error when invalid form is submitted', async (): Promise<void> => {
    await expectAsync(component.deleteAcount(testUser)).toBeRejectedWithError('Invalid form submitted');
  });

  it('should delete account', async (): Promise<void> => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    component.deleteAccountForm.setValue({ password: TEST_USER_PASSWORD });

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(auth.currentUser).withContext('currentUser').toEqual(testUser);
    expect(testUser.refreshToken).withContext('testUser.refreshToken').toBeTruthy();

    const promise = component.deleteAcount(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(auth.currentUser).withContext('currentUser').toEqual(testUser);

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(auth.currentUser).withContext('currentUser').toBeNull();
    expect(testUser.refreshToken).withContext('testUser.refreshToken').toBe('');
    expect(navigateSpy).withContext('navigateByUrl').toHaveBeenCalledOnceWith('/');
  });

  it('should handle reauthenticate errors', async (): Promise<void> => {
    const newPassword = 'f254)b65dE6d';
    component.deleteAccountForm.setValue({ password: newPassword });

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.deleteAcount(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/wrong-password');
  });

  it('should handle deleteUser errors', async (): Promise<void> => {
    component.deleteAccountForm.setValue({ password: TEST_USER_PASSWORD });
    spyOn(testUser, 'getIdToken').and.resolveTo('bad token');

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    const promise = component.deleteAcount(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/invalid-user-token');
  });

  it('should configure password FormControl', fakeAsync((): void => {
    expect(component.maxPasswordLength).withContext('maxPasswordLength').toBe(PASSWORDS.maxLength);
    expect(component.minPasswordLength).withContext('minPasswordLength').toBe(PASSWORDS.minLength);

    passwordControlTest(component.passwordCntrl);
  }));

  it('should configure password input', (): void => {
    passwordInputTest(fixture, 'fld-password', 'current-password');
  });

  it('should set password input aria-invalid attribute', (): void => {
    ariaInvalidTest(component.passwordCntrl, fixture, 'fld-password');
  });

  it('should configure password error messages', fakeAsync((): void => {
    passwordErrorMessagesTest(component.passwordCntrl, fixture, { errorsId: 'fld-password-msgs' });
  }));

  it('should configure delete account FormGroup', (): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.deleteAccountForm.value).withContext('value').toEqual({ password: null });
    expect(component.deleteAccountForm.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.deleteAccountForm.setValue({ password: '64b72a36-4ECD-4f0d' });

    expect(component.deleteAccountForm.valid).withContext('valid').toBeTrue();
  });

  it('should display submit errors', (): void => {
    component.$errorCode.set('auth/wrong-password');
    fixture.detectChanges();

    const compiled = getCompiled(fixture);

    expect(safeQuerySelector(compiled, '.alert:nth-of-type(2)').textContent)
      .withContext('second alert')
      .toContain('The password is invalid or the user does not have a password.');
  });

  it('should configure begin button', (): void => {
    const openSpy = spyOn(component, 'openDialog');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, '.button');

    bttnEl.click();

    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('should configure complete button', (): void => {
    const deleteAccountSpy = spyOn(component, 'deleteAcount');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, '.danger-button');

    expect(bttnEl.disabled).withContext('disabled').toBeTrue();

    component.deleteAccountForm.setValue({ password: 'b693-0250a38A1450' });
    fixture.detectChanges();

    expect(component.deleteAccountForm.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBeFalse();

    bttnEl.click();

    expect(deleteAccountSpy).toHaveBeenCalledTimes(1);
  });

  it('should configure cancel button', (): void => {
    const closeSpy = spyOn(component, 'closeDialog');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, '.success-color');

    bttnEl.click();

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
