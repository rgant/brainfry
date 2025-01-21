import { tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { FormControl } from '@angular/forms';

import { FORMS, PASSWORDS } from '@app/shared/constants';
import { getCompiled, safeQuerySelector } from '@testing/helpers';

export const passwordControlTest = (passwordControl: FormControl, validateStrength: boolean = false): void => {
  const expectedPassword = 'f8f93627';

  // Default state
  expect(passwordControl.value).withContext('value').toBeNull();
  expect(passwordControl.invalid).withContext('invalid').toBeTrue();

  // Valid
  passwordControl.setValue('08a2fGe2&7260b');

  expect(passwordControl.valid).withContext('valid').toBeTrue();

  // Below minimum length
  passwordControl.setValue(expectedPassword);

  expect(passwordControl.hasError('minlength')).withContext('has error minlength').toBeTrue();

  // Above maximum length
  const maxMultiplier = PASSWORDS.maxLength / expectedPassword.length; // 8 characters * 512 = 4096
  passwordControl.setValue(`${expectedPassword.repeat(maxMultiplier)}1`); // 4097 characters

  expect(passwordControl.hasError('maxlength')).withContext('has error maxlength').toBeTrue();

  if (validateStrength) {
    passwordControl.setValue('08a2fe27260b');

    expect(passwordControl.hasError('passwordstrength')).withContext('has error passwordstrength').toBeTrue();
  }

  // Required value
  passwordControl.setValue('');

  expect(passwordControl.hasError('required')).withContext('has error required').toBeTrue();
};

export const passwordErrorMessagesTest = (
  passwordControl: FormControl<string | null>,
  fixture: ComponentFixture<unknown>,
  errorsId: string,
  validateStrength: boolean = false
): void => {
  const compiled: HTMLElement = getCompiled(fixture);
  const errorsEl: HTMLSpanElement = safeQuerySelector(compiled, `#${errorsId}`);

  expect(passwordControl.dirty).withContext('dirty').toBeFalse();
  expect(errorsEl.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();

  // Required message
  passwordControl.markAsDirty();
  passwordControl.setErrors({ required: true });
  tick(FORMS.inputDebounce); // debounceTime
  fixture.detectChanges();

  /*
   * 'Please enter a new password.'
   * 'Please enter your current password.'
   * 'Please enter your password.'
   * 'Please re-enter your new password'
   */
  expect(errorsEl.textContent).toMatch(/Please (?:re-)?enter (?:a new|your(?: current)?) password\./u);

  // Minimum length message
  passwordControl.setErrors({ minlength: true });
  tick(FORMS.inputDebounce); // debounceTime
  fixture.detectChanges();

  expect(errorsEl.textContent).toContain(`Please enter a password that contains at least ${PASSWORDS.minLength} characters`);

  // Maximum length message
  passwordControl.setErrors({ maxlength: true });
  tick(FORMS.inputDebounce); // debounceTime
  fixture.detectChanges();

  expect(errorsEl.textContent).toContain(`Your password may not be longer than ${PASSWORDS.maxLength} characters.`);

  if (validateStrength) {
    passwordControl.setErrors({ passwordstrength: true });
    tick(FORMS.inputDebounce); // debounceTime
    fixture.detectChanges();

    expect(errorsEl.textContent).toContain('Your password is not very strong.');
  }

  // Hide message when control is valid.
  passwordControl.setErrors(null); // eslint-disable-line unicorn/no-null -- DOM uses null
  tick(FORMS.inputDebounce); // debounceTime
  fixture.detectChanges();

  expect(errorsEl.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();
};

export const passwordInputTest = (fixture: ComponentFixture<unknown>, fieldId: string, expectedAutocomplete: string): void => {
  const compiled: HTMLElement = getCompiled(fixture);
  const passwordInput: HTMLInputElement = safeQuerySelector(compiled, `#${fieldId}`);
  const errorsId: string | null = passwordInput.getAttribute('aria-describedby');

  expect(passwordInput.getAttribute('maxlength')).withContext('get attribute maxlength').toBe(`${PASSWORDS.maxLength}`);
  expect(passwordInput.getAttribute('minlength')).withContext('get attribute minlength').toBe(`${PASSWORDS.minLength}`);
  expect(passwordInput.getAttribute('type')).withContext('get attribute type').toBe('password');
  expect(passwordInput.getAttribute('autocomplete')).withContext('get attribute autocomplete').toBe(expectedAutocomplete);
  expect(passwordInput.hasAttribute('required')).withContext('has attribute required').toBeTrue();
  expect(compiled.querySelector(`label[for='${passwordInput.id}']`)).withContext(`label for #'${passwordInput.id}'`).toBeTruthy();
  expect(errorsId).withContext('get attribute aria-describedby').toBeTruthy();
  expect(compiled.querySelector(`#${errorsId}`)).withContext(`error id #${errorsId}`).toBeTruthy();
};
