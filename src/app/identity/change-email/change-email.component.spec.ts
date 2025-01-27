import { fakeAsync, TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { getCompiled, safeQuerySelector } from '@testing/utilities';

import { PASSWORDS } from '../identity-forms';
import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { emailControlTest, emailErrorMessagesTest, emailInputTest } from '../testing/email-field.spec';
import { passwordControlTest, passwordErrorMessagesTest, passwordInputTest } from '../testing/password-field.spec';
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
  let component: ChangeEmailComponent;
  let fixture: ComponentFixture<ChangeEmailComponent>;

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

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ ChangeEmailComponent ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChangeEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should configure login FormGroup', (): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.changeEmailForm.value).withContext('value').toEqual({ email1: null, email2: null, password: null });
    expect(component.changeEmailForm.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.changeEmailForm.setValue({ email1: '464f@bf86.6c3901f06536', email2: '464f@bf86.6c3901f06536', password: 'e1bf3aff-03bd' });

    expect(component.changeEmailForm.valid).withContext('valid').toBeTrue();
  });

  it('should submit form', (): void => {
    expect((): void => { component.onSubmit(); }).toThrowError('Invalid form submitted');
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

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
