import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';

import { provideOurFirebaseApp } from '~/app/core/firebase-app.provider';
import { USER$ } from '~/app/core/user.token';
import { FORMS } from '~/app/shared/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '~/testing/utilities';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { cleanupUsers, createAndSignInUser } from '../testing/test-users.spec';
import { UserPhotosService } from '../user-photos/user-photos.service';
import type { Photo } from '../user-photos/user-photos.service';
import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent', (): void => {
  let auth: Auth;
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let mockService: jasmine.SpyObj<UserPhotosService>;
  let testUser: User;

  const testUsers: User[] = [];
  const mockPhotosSubject$ = new Subject<Array<Partial<Photo>>>();
  const mockUserSubject$ = new Subject<User | null>();

  // This is really only necessary so that we don't export these users from the emulator
  afterAll(async (): Promise<void> => {
    await cleanupUsers(auth, testUsers);
  });

  beforeEach(async (): Promise<void> => {
    mockService = jasmine.createSpyObj<UserPhotosService>(
      'UserPhotosService',
      // eslint-disable-next-line rxjs/finnish, @typescript-eslint/no-unsafe-type-assertion -- mocking method to return subject
      { getProfilePhotos: mockPhotosSubject$ as Observable<Photo[]> },
    );

    await TestBed.configureTestingModule({
      imports: [ UserProfileComponent ],
      providers: [
        provideOurFirebaseApp(),
        provideEmulatedAuth(),
        // For somereason on this template the real user$ causes timeouts and async issues.
        // Replacing it with a mock resolves those and makes testing easier.
        // eslint-disable-next-line rxjs/finnish, rxjs/suffix-subjects -- Angular provider syntax cannot be in finnish
        { provide: USER$, useValue: mockUserSubject$ },
        { provide: UserPhotosService, useValue: mockService },
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

    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    component.profileForm.setValue({ displayName: 'Rustam', photoURL: null });

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

    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    component.profileForm.setValue({ displayName: 'Rustam', photoURL: null });
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

  it('should display spinner while waiting for user', (): void => {
    const compiled = getCompiled(fixture);

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeTruthy();
    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeNull();

    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
    fixture.detectChanges();

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeNull();
    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeTruthy();
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
    mockPhotosSubject$.next([]);
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
    mockPhotosSubject$.next([]);
    fixture.detectChanges();
    ariaInvalidTest(component.nameCntrl, fixture, 'fld-displayName');
  });

  it('should configure name error messages', fakeAsync((): void => {
    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
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

  it('should configure photo URL control', (): void => {
    // Default state valid
    expect(component.photoUrlCntrl.value).withContext('value').toBeNull();
    expect(component.photoUrlCntrl.valid).withContext('valid').toBeTrue();

    // Invalid pattern
    component.photoUrlCntrl.setValue('file.txt');

    expect(component.photoUrlCntrl.hasError('pattern')).withContext('has error pattern').toBeTrue();

    // Valid pattern
    component.photoUrlCntrl.setValue('file.gif');

    expect(component.photoUrlCntrl.hasError('pattern')).withContext('has error pattern').toBeFalse();
  });

  it('should configure photo url input', (): void => {
    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
    fixture.detectChanges();

    const compiled: HTMLElement = getCompiled(fixture);
    const photoUrlInpt: HTMLInputElement = safeQuerySelector(compiled, '#fld-customUrl');
    const errorsId: string | null = photoUrlInpt.getAttribute('aria-describedby');

    expect(photoUrlInpt.getAttribute('type')).withContext('get attribute type').toBe('url');
    expect(photoUrlInpt.getAttribute('autocomplete')).withContext('get attribute autocomplete').toBe('photo');
    expect(errorsId).withContext('get attribute aria-describedby').toBeTruthy();
    expect(compiled.querySelector(`label[for='${photoUrlInpt.id}']`))
      .withContext(`label for #${photoUrlInpt.id}`)
      .toBeTruthy();

    expect(compiled.querySelector(`#${errorsId}`))
      .withContext(`error id #${errorsId}`)
      .toBeTruthy();
  });

  it('should set photo url input aria-invalid attribute', (): void => {
    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
    component.photoUrlCntrl.setValue('/'); // Needs to default to invalid state for ariaInvalidTest tests.
    fixture.detectChanges();
    ariaInvalidTest(component.photoUrlCntrl, fixture, 'fld-customUrl');
  });

  it('should configure photo url error messages', fakeAsync((): void => {
    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
    fixture.detectChanges();

    const compiled: HTMLElement = getCompiled(fixture);
    const errorsEl: HTMLSpanElement = safeQuerySelector(compiled, '#fld-customUrl-msgs');

    expect(component.photoUrlCntrl.dirty).withContext('dirty').toBeFalse();
    expect(errorsEl.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();

    // Required message
    component.photoUrlCntrl.markAsDirty();
    component.photoUrlCntrl.setErrors({ pattern: true });
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(errorsEl.textContent).toContain('Photo URL must link to a file with an image file extension');

    // Hide message when control is valid.
    component.photoUrlCntrl.setErrors(null); // eslint-disable-line unicorn/no-null -- DOM uses null
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(errorsEl.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();
  }));

  /*
   * When running the whole test suite this test produces noise in the console log from NgOptimizedImage:
   * > NG02952: The NgOptimizedImage directive (activated on an <img> element with the
   * > `ngSrc="http://localhost:9877/imgs/logo-260.png"`) has detected that the height of the
   * > fill-mode image is zero. This is likely because the containing element does not have the CSS
   * > 'position' property set to one of the following: "relative", "fixed", or "absolute". To fix
   * > this problem, make sure the container element has the CSS 'position' property defined and the
   * > height of the element is not zero.
   */
  it('should show photo url image', (): void => {
    const expectedUrl = 'http://localhost:9877/imgs/logo-260.png';

    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
    component.photoUrlCntrl.setValue(expectedUrl);
    fixture.detectChanges();

    const compiled: HTMLElement = getCompiled(fixture);
    const imgEl: HTMLImageElement = safeQuerySelector(compiled, '.photo-block img');

    expect(imgEl.src).withContext('img.src').toBe(expectedUrl);

    // should hide when invalid
    component.photoUrlCntrl.setErrors({ pattern: true });
    fixture.detectChanges();

    expect(compiled.querySelector('.photo-block')).withContext('.photo-block').toBeNull();
  });

  it('should switch to photo upload on click', (): void => {
    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
    fixture.detectChanges();

    const compiled: HTMLElement = getCompiled(fixture);
    const buttonEl: HTMLButtonElement = safeQuerySelector(compiled, '.toggle-wrap button');

    expect(compiled.querySelector('.custom-url')).withContext('.custom-url').toBeTruthy();
    expect(compiled.querySelector('.photos')).withContext('.photos').toBeNull();

    buttonEl.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.custom-url')).withContext('.custom-url').toBeNull();
    expect(compiled.querySelector('.photos')).withContext('.photos').toBeTruthy();
  });

  /*
   * When running the whole test suite this test produces noise in the console log from NgOptimizedImage:
   * > NG02952: The NgOptimizedImage directive (activated on an <img> element with the
   * > `ngSrc="http://localhost:9877/imgs/logo-260.png"`) has detected that the height of the
   * > fill-mode image is zero. This is likely because the containing element does not have the CSS
   * > 'position' property set to one of the following: "relative", "fixed", or "absolute". To fix
   * > this problem, make sure the container element has the CSS 'position' property defined and the
   * > height of the element is not zero.
   * Frequently 3 times for each expected photo
   */
  it('should display upload photos interface', (): void => {
    const expectedImg = 'http://localhost:9877/imgs/logo-260.png';
    const mockPhotos = [
      { url: 'http://localhost:9877/imgs/logo-100.png' },
      { url: expectedImg },
      { url: 'http://localhost:9877/apple-touch-icon.png' },
    ];

    // @ts-expect-error setting a private property for testing
    testUser.photoURL = expectedImg;
    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next(mockPhotos);
    fixture.detectChanges();

    const compiled: HTMLElement = getCompiled(fixture);
    const photosEl: HTMLDivElement = safeQuerySelector(compiled, '.photos');
    const inptEls: NodeListOf<HTMLInputElement> = photosEl.querySelectorAll('input');

    expect(compiled.querySelector('.custom-url')).withContext('.custom-url').toBeNull();
    expect(component.photoUrlCntrl.value).withContext('photoUrlCntrl.value').toBe(expectedImg);

    for (const [ indx, mockPhoto ] of mockPhotos.entries()) {
      const expectedId = `fld-photoURL-${indx}`;
      const expectedInput = inptEls[indx];
      if (!expectedInput) {
        throw new Error(`Missing input element for ${indx}`);
      }
      const [ expectedLabel ] = expectedInput.labels ?? [];
      if (!expectedLabel) {
        throw new Error(`Missing label element for ${indx}`);
      }

      expect(expectedInput.id).toContain(expectedId);
      expect(expectedInput.checked).withContext(`${indx} checked`).toBe(mockPhoto.url === expectedImg);
      expect(expectedLabel.getAttribute('for')).toContain(expectedId);

      const imgEl: HTMLImageElement = safeQuerySelector(expectedLabel, 'img');

      expect(imgEl.src).toBe(mockPhoto.url);
    }

    // UI Toggle
    const buttonEl: HTMLButtonElement = safeQuerySelector(compiled, '.toggle-wrap button');

    expect(compiled.querySelector('.custom-url')).withContext('.custom-url').toBeNull();
    expect(compiled.querySelector('.photos')).withContext('.photos').toBeTruthy();

    buttonEl.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.custom-url')).withContext('.custom-url').toBeTruthy();
    expect(compiled.querySelector('.photos')).withContext('.photos').toBeNull();
  });

  it('should configure user profile FormGroup', (): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.profileForm.value).withContext('value').toEqual({ displayName: null, photoURL: null });
    expect(component.profileForm.invalid).withContext('invalid').toBeTrue();

    // Valid
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    component.profileForm.setValue({ displayName: 'Lucio', photoURL: null });

    expect(component.profileForm.valid).withContext('valid').toBeTrue();
  });

  it('should display submit errors', (): void => {
    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
    fixture.detectChanges();

    component.$errorCode.set('auth/network-request-failed');
    fixture.detectChanges();

    const compiled = getCompiled(fixture);

    expect(safeQuerySelector(compiled, '.alert').textContent).toContain('A network error');
  });

  it('should configure submit button', (): void => {
    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
    fixture.detectChanges();

    const submitSpy = spyOn(component, 'onSubmit');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, '.button');

    expect(bttnEl.disabled).withContext('disabled').toBeTrue();

    component.nameCntrl.setValue('Catherina');
    fixture.detectChanges();

    expect(component.nameCntrl.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBeFalse();

    bttnEl.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('should show spinner when the form is hidden', (): void => {
    mockUserSubject$.next(testUser);
    mockPhotosSubject$.next([]);
    fixture.detectChanges();

    const compiled = getCompiled(fixture);

    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeTruthy();
    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeNull();
    expect(compiled.querySelector('form')).withContext('form').toBeTruthy();

    component.$showForm.set(false);
    fixture.detectChanges();

    expect(compiled.querySelector('.main-card')).withContext('.main-card').toBeTruthy();
    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeTruthy();
    expect(compiled.querySelector('form')).withContext('form').toBeNull();
  });
});
