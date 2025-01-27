import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { FORMS, PASSWORDS } from '@app/shared/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
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
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

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

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have password constraints', (): void => {
    expect(component.maxPasswordLength).withContext('maxPasswordLength').toBe(PASSWORDS.maxLength);
    expect(component.minPasswordLength).withContext('minPasswordLength').toBe(PASSWORDS.minLength);
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

  it('should submit form', (): void => {
    expect((): void => { component.onSubmit(); }).toThrowError('Invalid form submitted');
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
