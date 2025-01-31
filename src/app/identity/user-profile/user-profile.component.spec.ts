import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { Subject } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { USER$ } from '@app/core/user.token';
import { FORMS } from '@app/shared/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { cleanupUsers, createAndSignInUser } from '../testing/test-users.spec';
import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent', (): void => {
  let auth: Auth;
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let testUser: User;

  const testUsers: User[] = [];
  const mockUserSubject$ = new Subject<User | null>();

  // This is really only necessary so that we don't export these users from the emulator
  afterAll(async (): Promise<void> => {
    await cleanupUsers(auth, testUsers);
  });

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ UserProfileComponent ],
      providers: [
        provideOurFirebaseApp(),
        provideEmulatedAuth(),
        // For somereason on this template the real user$ causes timeouts and async issues.
        // Replacing it with a mock resolves those and makes testing easier.
        // eslint-disable-next-line rxjs/finnish, rxjs/suffix-subjects -- Angular provider syntax cannot be in finnish
        { provide: USER$, useValue: mockUserSubject$ },
      ],
    })
      .compileComponents();

    auth = TestBed.inject(Auth);

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    testUser = await createAndSignInUser(auth);
    testUsers.push(testUser);
  });

  it('should error when invalid form is submitted', async (): Promise<void> => {
    await expectAsync(component.onSubmit(testUser)).toBeRejectedWithError('Invalid form submitted');
  });

  it('should update user profile', async (): Promise<void> => {
    mockUserSubject$.next(testUser);

    component.profileForm.setValue({ displayName: 'Rustam' });

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(testUser.displayName).withContext('displayName').toBeNull();

    const promise = component.onSubmit(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(testUser.displayName).withContext('displayName').toBe('Rustam');
  });

  it('should handle profile update error', async (): Promise<void> => {
    mockUserSubject$.next(testUser);

    component.profileForm.setValue({ displayName: 'Rustam' });
    spyOn(testUser, 'getIdToken').and.resolveTo('bad token');

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');
    expect(testUser.displayName).withContext('displayName').toBeNull();

    const promise = component.onSubmit(testUser);

    expect(component.$showForm()).withContext('$showForm').toBeFalse();
    expect(component.$errorCode()).withContext('$errorCode').toBe('');

    await promise;

    expect(component.$showForm()).withContext('$showForm').toBeTrue();
    expect(component.$errorCode()).withContext('$errorCode').toBe('auth/invalid-user-token');
    expect(testUser.displayName).withContext('displayName').toBeNull();
  });

  it('should configure name control', (): void => {
    // Default state
    expect(component.nameCntrl.value).withContext('value').toBeNull();
    expect(component.nameCntrl.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.nameCntrl.setValue('Oscar');

    expect(component.nameCntrl.valid).withContext('valid').toBeTrue();

    // Required value
    component.nameCntrl.setValue('');

    expect(component.nameCntrl.hasError('required')).withContext('has error required').toBeTrue();
  });

  it('should configure display name input', (): void => {
    mockUserSubject$.next(testUser);
    fixture.detectChanges();

    const compiled: HTMLElement = getCompiled(fixture);
    const nameInput: HTMLInputElement = safeQuerySelector(compiled, '#fld-displayName');
    const errorsId: string | null = nameInput.getAttribute('aria-describedby');

    expect(nameInput.getAttribute('type')).withContext('get attribute type').toBe('text');
    expect(nameInput.getAttribute('autocomplete')).withContext('get attribute autocomplete').toBe('name');
    expect(nameInput.hasAttribute('autofocus')).withContext('has attribute autofocus').toBeFalse();
    expect(nameInput.hasAttribute('required')).withContext('has attribute required').toBeTrue();
    expect(errorsId).withContext('get attribute aria-describedby').toBeTruthy();
    expect(compiled.querySelector(`label[for='${nameInput.id}']`))
      .withContext(`label for #${nameInput.id}`)
      .toBeTruthy();

    expect(compiled.querySelector(`#${errorsId}`))
      .withContext(`error id #${errorsId}`)
      .toBeTruthy();
  });

  it('should set name input aria-invalid attribute', (): void => {
    mockUserSubject$.next(testUser);
    fixture.detectChanges();
    ariaInvalidTest(component.nameCntrl, fixture, 'fld-displayName');
  });

  it('should configure name error messages', fakeAsync((): void => {
    mockUserSubject$.next(testUser);
    fixture.detectChanges();

    const compiled: HTMLElement = getCompiled(fixture);
    const errorsEl: HTMLSpanElement = safeQuerySelector(compiled, '#fld-displayName-msgs');

    expect(component.nameCntrl.dirty).withContext('dirty').toBeFalse();
    expect(errorsEl.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();

    // Required message
    component.nameCntrl.markAsDirty();
    component.nameCntrl.setErrors({ required: true });
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(errorsEl.textContent).toContain('Tell use how you would like to be addressed.');

    // Hide message when control is valid.
    component.nameCntrl.setErrors(null); // eslint-disable-line unicorn/no-null -- DOM uses null
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(errorsEl.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();
  }));

  it('should configure reset password FormGroup', (): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.profileForm.value).withContext('value').toEqual({ displayName: null });
    expect(component.profileForm.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.profileForm.setValue({ displayName: 'Lucio' });

    expect(component.profileForm.valid).withContext('valid').toBeTrue();
  });

  it('should display submit errors', (): void => {
    mockUserSubject$.next(testUser);
    fixture.detectChanges();

    component.$errorCode.set('auth/network-request-failed');
    fixture.detectChanges();

    const compiled = getCompiled(fixture);

    expect(safeQuerySelector(compiled, '.alert').textContent).toContain('A network error');
  });

  it('should configure submit button', (): void => {
    mockUserSubject$.next(testUser);
    fixture.detectChanges();

    const submitSpy = spyOn(component, 'onSubmit');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');

    expect(bttnEl.disabled).withContext('disabled').toBeTrue();

    component.nameCntrl.setValue('Catherina');
    fixture.detectChanges();

    expect(component.nameCntrl.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBeFalse();

    bttnEl.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
