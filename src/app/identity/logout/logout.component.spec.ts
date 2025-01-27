import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { provideRouter, Router } from '@angular/router';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { DEFAULT_TEST_USER } from '@testing/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { LogoutComponent } from './logout.component';

describe('LogoutComponent', (): void => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ LogoutComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth(), provideRouter([]) ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should logout and then navigate to /', async (): Promise<void> => {
    const auth = TestBed.inject(Auth);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);

    await signInWithEmailAndPassword(auth, DEFAULT_TEST_USER.email, DEFAULT_TEST_USER.password);

    expect(auth.currentUser).withContext('Auth.currentUser').toBeTruthy();
    expect(component.$blockWindow()).withContext('blockWindow').toBeFalse();

    await component.logout();

    expect(component.$blockWindow()).withContext('blockWindow').toBeTrue();
    expect(auth.currentUser).withContext('Auth.currentUser').toBeNull();
    expect(navigateSpy).withContext('navigateByUrl').toHaveBeenCalledOnceWith('/');
  });

  it('should call logout on click', (): void => {
    const buttonSpy = spyOn(component, 'logout').and.callThrough();
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');

    expect(bttnEl.disabled).withContext('disabled').toBeFalse();

    bttnEl.click();
    fixture.detectChanges();

    expect(buttonSpy).toHaveBeenCalledTimes(1);
    expect(bttnEl.disabled).withContext('disabled').toBeTrue();
  });

  it('should show modal spinner during logoout', (): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeNull();

    bttnEl.click();
    fixture.detectChanges();

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeTruthy();
  });
});
