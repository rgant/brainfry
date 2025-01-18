import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { FORMS, PASSWORDS } from '@app/shared/constants';
import { getCompiled, safeQuerySelector } from '@testing/helpers';

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
    // Default state
    expect(component.emailCntrl.value).withContext('value').toBeNull();
    expect(component.emailCntrl.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.emailCntrl.setValue('9cce@49e9.855a');

    expect(component.emailCntrl.valid).withContext('valid').toBeTrue();

    // Must be valid email
    component.emailCntrl.setValue('1e40c69a51c1');

    expect(component.emailCntrl.hasError('email')).withContext('has error email').toBeTrue();

    // Required value
    component.emailCntrl.setValue('');

    expect(component.emailCntrl.hasError('required')).withContext('has error required').toBeTrue();
  });

  it('should configure email input', (): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const emailInput: HTMLInputElement = safeQuerySelector(compiled, '#fld-newEmail');
    const errorsId: string | null = emailInput.getAttribute('aria-describedby');

    expect(emailInput.getAttribute('type')).withContext('get attribute type').toBe('email');
    expect(emailInput.getAttribute('autocomplete')).withContext('get attribute autocomplete').toBe('email');
    expect(emailInput.hasAttribute('autofocus')).withContext('has attribute autofocus').toBeTrue();
    expect(emailInput.hasAttribute('required')).withContext('has attribute required').toBeTrue();
    expect(compiled.querySelector(`label[for='${emailInput.id}']`)).withContext(`label for #'${emailInput.id}'`).toBeTruthy();
    expect(errorsId).withContext('get attribute aria-describedby').toBeTruthy();
    expect(compiled.querySelector(`#${errorsId}`)).withContext(`error id #${errorsId}`).toBeTruthy();
  });

  it('should set email field aria-invalid attribute', (): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const emailInput: HTMLInputElement = safeQuerySelector(compiled, '#fld-newEmail');

    expect(component.emailCntrl.invalid).withContext('emailCntrl.invalid').toBe(true);
    expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

    component.emailCntrl.markAsDirty();
    component.emailCntrl.markAsTouched();
    fixture.detectChanges();

    // When invalid, dirty, and touched
    expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('true');

    // When not one of invalid, dirty, or touched

    // Touched
    component.emailCntrl.markAsUntouched();
    fixture.detectChanges();

    expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

    component.emailCntrl.markAsTouched();

    // Dirty
    component.emailCntrl.markAsPristine();
    fixture.detectChanges();

    expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

    component.emailCntrl.markAsDirty();

    // Invalid
    component.emailCntrl.setErrors(null); // eslint-disable-line unicorn/no-null -- FormControl.errors use null
    fixture.detectChanges();

    expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

    component.emailCntrl.setErrors({ required: true });
  });

  it('should configure email error messages', fakeAsync((): void => {
    const compiled: HTMLElement = getCompiled(fixture);

    expect(component.emailCntrl.dirty).withContext('dirty').toBeFalse();
    expect(compiled.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();

    // Required message
    component.emailCntrl.markAsDirty();
    component.emailCntrl.setErrors({ required: true });
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(safeQuerySelector(compiled, '.form-alerts').textContent).toContain('Please enter your email address.');

    // Valid email message
    component.emailCntrl.setErrors({ email: true });
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(safeQuerySelector(compiled, '.form-alerts').textContent).toContain('Please enter a valid email address.');

    // Hide message when control is valid.
    component.emailCntrl.setErrors(null); // eslint-disable-line unicorn/no-null -- DOM uses null
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(compiled.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();
  }));

  it('should configure password FormControl', (): void => {
    // Default state
    expect(component.passwordCntrl.value).withContext('value').toBeNull();
    expect(component.passwordCntrl.invalid).withContext('invalid').toBeTrue();
    expect(component.maxPasswordLength).withContext('maxPasswordLength').toBe(PASSWORDS.maxLength);
    expect(component.minPasswordLength).withContext('minPasswordLength').toBe(PASSWORDS.minLength);

    // Valid
    component.passwordCntrl.setValue('08a2fe27260b');

    expect(component.passwordCntrl.valid).withContext('valid').toBeTrue();

    // Below minimum length
    component.passwordCntrl.setValue('f8f93627');

    expect(component.passwordCntrl.hasError('minlength')).withContext('has error minlength').toBeTrue();

    // Above maximum length
    const maxMultiplier = 512; // 8 characters * 512 = 4096
    component.passwordCntrl.setValue(`${'f8f93627'.repeat(maxMultiplier)}1`);

    expect(component.passwordCntrl.hasError('maxlength')).withContext('has error maxlength').toBeTrue();

    // Required value
    component.passwordCntrl.setValue('');

    expect(component.passwordCntrl.hasError('required')).withContext('has error required').toBeTrue();
  });

  it('should configure password input', (): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const passwordInput: HTMLInputElement = safeQuerySelector(compiled, '#fld-password');
    const errorsId: string | null = passwordInput.getAttribute('aria-describedby');

    expect(passwordInput.getAttribute('maxlength')).withContext('get attribute maxlength').toBe(`${PASSWORDS.maxLength}`);
    expect(passwordInput.getAttribute('minlength')).withContext('get attribute minlength').toBe(`${PASSWORDS.minLength}`);
    expect(passwordInput.getAttribute('type')).withContext('get attribute type').toBe('password');
    expect(passwordInput.getAttribute('autocomplete')).withContext('get attribute autocomplete').toBe('current-password');
    expect(passwordInput.hasAttribute('required')).withContext('has attribute required').toBeTrue();
    expect(compiled.querySelector(`label[for='${passwordInput.id}']`)).withContext(`label for #'${passwordInput.id}'`).toBeTruthy();
    expect(errorsId).withContext('get attribute aria-describedby').toBeTruthy();
    expect(compiled.querySelector(`#${errorsId}`)).withContext(`error id #${errorsId}`).toBeTruthy();
  });

  it('should set password field aria-invalid attribute', (): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const passwordInput: HTMLInputElement = safeQuerySelector(compiled, '#fld-password');

    expect(component.emailCntrl.invalid).withContext('emailCntrl.invalid').toBe(true);
    expect(passwordInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

    component.passwordCntrl.markAsDirty();
    component.passwordCntrl.markAsTouched();
    fixture.detectChanges();

    // When invalid, dirty, and touched
    expect(passwordInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('true');

    // When not one of invalid, dirty, or touched

    // Touched
    component.passwordCntrl.markAsUntouched();
    fixture.detectChanges();

    expect(passwordInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

    component.passwordCntrl.markAsTouched();

    // Dirty
    component.passwordCntrl.markAsPristine();
    fixture.detectChanges();

    expect(passwordInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

    component.passwordCntrl.markAsDirty();

    // Invalid
    component.passwordCntrl.setErrors(null); // eslint-disable-line unicorn/no-null -- FormControl.errors use null
    fixture.detectChanges();

    expect(passwordInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

    component.passwordCntrl.setErrors({ required: true });
  });

  it('should configure password error messages', fakeAsync((): void => {
    const compiled: HTMLElement = getCompiled(fixture);

    expect(component.passwordCntrl.dirty).withContext('dirty').toBeFalse();
    expect(compiled.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();

    // Required message
    component.passwordCntrl.markAsDirty();
    component.passwordCntrl.setErrors({ required: true });
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(safeQuerySelector(compiled, '.form-alerts').textContent).toContain('Please enter your password.');

    // Minimum length message
    component.passwordCntrl.setErrors({ minlength: true });
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(safeQuerySelector(compiled, '.form-alerts').textContent)
      .toContain(`Please enter a password that contains at least ${PASSWORDS.minLength} characters`);

    // Maximum length message
    component.passwordCntrl.setErrors({ maxlength: true });
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(safeQuerySelector(compiled, '.form-alerts').textContent)
      .toContain(`Your password may not be longer than ${PASSWORDS.maxLength} characters.`);

    // Hide message when control is valid.
    component.passwordCntrl.setErrors(null); // eslint-disable-line unicorn/no-null -- DOM uses null
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(compiled.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();
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
