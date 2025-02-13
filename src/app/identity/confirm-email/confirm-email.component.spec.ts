import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { UNVERIFIED_TEST_USER } from '@testing/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { ConfirmEmailComponent } from './confirm-email.component';

describe('ConfirmEmailComponent', (): void => {
  let auth: Auth;
  let component: ConfirmEmailComponent;
  let fixture: ComponentFixture<ConfirmEmailComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ ConfirmEmailComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth() ],
    })
      .compileComponents();

    auth = TestBed.inject(Auth);

    fixture = TestBed.createComponent(ConfirmEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send verification email', async (): Promise<void> => {
    const { user } = await signInWithEmailAndPassword(auth, UNVERIFIED_TEST_USER.email, UNVERIFIED_TEST_USER.password);

    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('unsent');

    const promise = component.sendConfirmEmail(user);

    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('sending');

    await promise;

    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('sent');

    // Prevent cross test pollution because it seems users can remain logged in across tests.
    await signOut(auth);
  });

  it('should handle send verification email error', async (): Promise<void> => {
    const { user } = await signInWithEmailAndPassword(auth, UNVERIFIED_TEST_USER.email, UNVERIFIED_TEST_USER.password);
    spyOn(user, 'getIdToken').and.resolveTo('bad token');

    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('unsent');

    const promise = component.sendConfirmEmail(user);

    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('sending');

    await promise;

    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/invalid-user-token');
    expect(component.$verificationStatus()).withContext('$verificationStatus').toBe('sent');

    // Prevent cross test pollution because it seems users can remain logged in across tests.
    await signOut(auth);
  });

  it('should show spinner', async (): Promise<void> => {
    const compiled = getCompiled(fixture);

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeTruthy();
    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeNull();

    await signInWithEmailAndPassword(auth, UNVERIFIED_TEST_USER.email, UNVERIFIED_TEST_USER.password);
    // Sometimes this test fails because it doesn't wait for the Observable to emit
    await firstValueFrom(component.user$);
    fixture.detectChanges();

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeNull();
    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeTruthy();

    // Prevent cross test pollution because it seems users can remain logged in across tests.
    await signOut(auth);
  });

  describe('with unverified user', (): void => {
    afterEach(async (): Promise<void> => {
      // Prevent cross test pollution because it seems users can remain logged in across tests.
      await signOut(auth);
    });

    beforeEach(async (): Promise<void> => {
      await signInWithEmailAndPassword(auth, UNVERIFIED_TEST_USER.email, UNVERIFIED_TEST_USER.password);
      // Sometimes the tests fail because it doesn't wait for the Observable to emit
      await firstValueFrom(component.user$);
      fixture.detectChanges();
    });

    it('should display explaination paragraph', (): void => {
      const compiled = getCompiled(fixture);

      expect(safeQuerySelector(compiled, 'p').textContent)
        .withContext('first p')
        .toContain(`send an email to ${UNVERIFIED_TEST_USER.email}`);
    });

    it('should call sendConfirmEmail when button is clicked', (): void => {
      const compiled = getCompiled(fixture);
      const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');
      const sendSpy = spyOn(component, 'sendConfirmEmail');

      expect(bttnEl.textContent).toContain('Send verification email');
      expect(bttnEl.disabled).withContext('disabled').toBeFalse();

      bttnEl.click();

      // Trying to use `auth.currentUser` here results in unequal objects with differences in
      // `stsTokenManager.accessToken`, `stsTokenManager.expirationTime`, and `accessToken` properties.
      expect(sendSpy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ uid: UNVERIFIED_TEST_USER.userId }));

      component.$verificationStatus.set('sending');
      fixture.detectChanges();

      expect(bttnEl.disabled).withContext('disabled').toBeTrue();
      expect(bttnEl.textContent).toContain('Send verification email');

      component.$verificationStatus.set('sent');
      fixture.detectChanges();

      expect(bttnEl.disabled).withContext('disabled').toBeFalse();
      expect(bttnEl.textContent).toContain('Resend verification email');
    });

    it('should display send success message', (): void => {
      component.$verificationStatus.set('sent');
      fixture.detectChanges();

      const compiled = getCompiled(fixture);

      expect(safeQuerySelector(compiled, 'p:nth-of-type(2)').textContent)
        .withContext('second p')
        .toContain(`A verification email has been sent to ${UNVERIFIED_TEST_USER.email}.`);
    });

    it('should display send failure message', (): void => {
      component.$verificationStatus.set('sent');
      component.$errorCode.set('auth/too-many-requests');
      fixture.detectChanges();

      const compiled = getCompiled(fixture);

      expect(safeQuerySelector(compiled, 'p:nth-of-type(2)').textContent)
        .withContext('second p')
        .toContain('We have blocked all requests from this device');
    });
  });
});
