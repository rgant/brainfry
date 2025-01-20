import { fakeAsync, TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { PASSWORDS } from '@app/shared/constants';
import { getCompiled, safeQuerySelector } from '@testing/helpers';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
import { ChangePasswordComponent } from './change-password.component';

const passwordFields = [
  {
    autoComplete: 'current-password',
    control: 'currentPwCntrl',
    errorId: 'fld-currentPw-msgs',
    inputId: 'fld-currentPw',
  },
  {
    autoComplete: 'new-password',
    control: 'password1Cntrl',
    errorId: 'fld-password1-msgs',
    inputId: 'fld-password1',
  },
  {
    autoComplete: 'new-password',
    control: 'password2Cntrl',
    errorId: 'fld-password2-msgs',
    inputId: 'fld-password2',
  },
] as const;

type FieldSetup = typeof passwordFields[number];

describe('ChangePasswordComponent', (): void => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  const passwordFieldTests = ({ autoComplete, control, errorId, inputId }: FieldSetup): void => {
    it(`should configure current ${control} FormControl`, (): void => {
      const cntrl = component[control];
      passwordControlTest(cntrl);
    });

    it(`should configure ${control} input`, (): void => {
      passwordInputTest(fixture, inputId, autoComplete);
    });

    it(`should set ${control} input aria-invalid attribute`, (): void => {
      const cntrl = component[control];
      ariaInvalidTest(cntrl, fixture, inputId);
    });

    it(`should configure ${control} error messages`, fakeAsync((): void => {
      const cntrl = component[control];
      passwordErrorMessagesTest(cntrl, fixture, errorId);
    }));
  };

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ ChangePasswordComponent ],
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

  it('should configure change password FormGroup', (): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.changePasswordForm.value).withContext('value').toEqual({ currentPw: null, password1: null, password2: null });
    expect(component.changePasswordForm.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.changePasswordForm.setValue({ currentPw: 'b1851b66-191', password1: '3bbce452c731', password2: '3bbce452c731' });

    expect(component.changePasswordForm.valid).withContext('valid').toBeTrue();
  });

  it('should submit form', (): void => {
    expect((): void => { component.onSubmit(); }).toThrowError('Invalid form submitted');
  });

  it('should configure submit button', (): void => {
    const submitSpy = spyOn(component, 'onSubmit');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');

    expect(bttnEl.disabled).withContext('disabled').toBe(true);

    component.changePasswordForm.setValue({ currentPw: '9492906e-492', password1: '9d8aef795f75', password2: '9d8aef795f75' });
    fixture.detectChanges();

    expect(component.changePasswordForm.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBe(false);

    bttnEl.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
