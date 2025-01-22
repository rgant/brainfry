import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { FORMS, PASSWORDS } from '@app/shared/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/helpers';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
import { ResetPasswordComponent } from './reset-password.component';

const passwordFields = [
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

describe('ResetPasswordComponent', (): void => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

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
      imports: [ ResetPasswordComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth() ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
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
    expect(component.resetPasswordForm.value).withContext('value').toEqual({ password1: null, password2: null });
    expect(component.resetPasswordForm.invalid).withContext('invalid').toBeTrue();

    // Password Mismatch
    component.resetPasswordForm.setValue({ password1: '571^e3c0-6Ed4-46f9', password2: 'b4ed-9c249d447ef7' });
    tick(FORMS.inputDebounce);

    expect(component.resetPasswordForm.invalid).withContext('invalid').toBeTrue();
    expect(component.$formPasswordsInvalid()).withContext('$formPasswordsInvalid').toBeTrue();

    // Valid
    component.resetPasswordForm.setValue({ password1: '68*0164eC676', password2: '68*0164eC676' });
    tick(FORMS.inputDebounce);

    expect(component.resetPasswordForm.valid).withContext('valid').toBeTrue();
    expect(component.$formPasswordsInvalid()).withContext('$formPasswordsInvalid').toBeFalse();
  }));

  it('should display password match form errors', fakeAsync((): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const frmErrsEl: HTMLDivElement = safeQuerySelector(compiled, '#frm-msgs');

    expect(frmErrsEl.querySelector('.form-alerts')).withContext('.form-alert').toBeNull();

    component.resetPasswordForm.setValue({ password1: '95B07$d7-4530-43db', password2: '87f9-7e2d71c9cf03' });
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

    expect(bttnEl.disabled).withContext('disabled').toBe(true);

    component.resetPasswordForm.setValue({ password1: 'e8a5&0C8f8c7', password2: 'e8a5&0C8f8c7' });
    fixture.detectChanges();

    expect(component.resetPasswordForm.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBe(false);

    bttnEl.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
