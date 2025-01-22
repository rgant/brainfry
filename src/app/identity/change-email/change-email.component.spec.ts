import { fakeAsync, TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { PASSWORDS } from '@app/shared/constants';
import { getCompiled, safeQuerySelector } from '@testing/helpers';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { emailControlTest, emailErrorMessagesTest, emailInputTest } from '../testing/email-field.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
import { ChangeEmailComponent } from './change-email.component';

describe('ChangeEmailComponent', (): void => {
  let component: ChangeEmailComponent;
  let fixture: ComponentFixture<ChangeEmailComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ ChangeEmailComponent ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChangeEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should configure email FormControl', (): void => {
    emailControlTest(component.emailCntrl);
  });

  it('should configure email input', (): void => {
    emailInputTest(fixture, 'fld-newEmail');
  });

  it('should set email input aria-invalid attribute', (): void => {
    ariaInvalidTest(component.emailCntrl, fixture, 'fld-newEmail');
  });

  it('should configure email error messages', fakeAsync((): void => {
    emailErrorMessagesTest(component.emailCntrl, fixture, 'fld-newEmail-msgs');
  }));

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
    expect(component.changeEmailForm.value).withContext('value').toEqual({ email: null, password: null });
    expect(component.changeEmailForm.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.changeEmailForm.setValue({ email: '464f@bf86.6c3901f06536', password: 'e1bf3aff-03bd' });

    expect(component.changeEmailForm.valid).withContext('valid').toBeTrue();
  });

  it('should submit form', (): void => {
    expect((): void => { component.onSubmit(); }).toThrowError('Invalid form submitted');
  });

  it('should configure submit button', (): void => {
    const submitSpy = spyOn(component, 'onSubmit');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');

    expect(bttnEl.disabled).withContext('disabled').toBe(true);

    component.changeEmailForm.setValue({ email: 'ce5a@4de7.a2db', password: 'ec6309685851b17d146d' });
    fixture.detectChanges();

    expect(component.changeEmailForm.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBe(false);

    bttnEl.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
