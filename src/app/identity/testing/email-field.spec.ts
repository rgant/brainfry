import { tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { FormControl } from '@angular/forms';

import { FORMS } from '@app/shared/constants';
import { getCompiled, safeQuerySelector } from '@testing/helpers';

export const emailControlTest = (emailControl: FormControl): void => {
  // Default state
  expect(emailControl.value).withContext('value').toBeNull();
  expect(emailControl.invalid).withContext('invalid').toBeTrue();

  // Valid
  emailControl.setValue('9cce@49e9.855a');

  expect(emailControl.valid).withContext('valid').toBeTrue();

  // Must be valid email
  emailControl.setValue('1e40c69a51c1');

  expect(emailControl.hasError('email')).withContext('has error email').toBeTrue();

  // Required value
  emailControl.setValue('');

  expect(emailControl.hasError('required')).withContext('has error required').toBeTrue();
};

export const emailErrorMessagesTest = (
  emailControl: FormControl<string | null>,
  fixture: ComponentFixture<unknown>,
  errorsId: string,
): void => {
  const compiled: HTMLElement = getCompiled(fixture);
  const errorsEl: HTMLSpanElement = safeQuerySelector(compiled, `#${errorsId}`);

  expect(emailControl.dirty).withContext('dirty').toBeFalse();
  expect(errorsEl.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();

  // Required message
  emailControl.markAsDirty();
  emailControl.setErrors({ required: true });
  tick(FORMS.inputDebounce); // debounceTime
  fixture.detectChanges();

  expect(errorsEl.textContent).toMatch(/Please enter your (?:new )?email address\./u);

  // Valid email message
  emailControl.setErrors({ email: true });
  tick(FORMS.inputDebounce); // debounceTime
  fixture.detectChanges();

  expect(errorsEl.textContent).toContain('Please enter a valid email address.');

  // Hide message when control is valid.
  emailControl.setErrors(null); // eslint-disable-line unicorn/no-null -- DOM uses null
  tick(FORMS.inputDebounce); // debounceTime
  fixture.detectChanges();

  expect(errorsEl.querySelector('.form-alerts')).withContext('.form-alerts').toBeNull();
};

export const emailInputTest = (fixture: ComponentFixture<unknown>, fieldId: string): void => {
  const compiled: HTMLElement = getCompiled(fixture);
  const emailInput: HTMLInputElement = safeQuerySelector(compiled, `#${fieldId}`);
  const errorsId: string | null = emailInput.getAttribute('aria-describedby');

  expect(emailInput.getAttribute('type')).withContext('get attribute type').toBe('email');
  expect(emailInput.getAttribute('autocomplete')).withContext('get attribute autocomplete').toBe('email');
  expect(emailInput.hasAttribute('autofocus')).withContext('has attribute autofocus').toBeTrue();
  expect(emailInput.hasAttribute('required')).withContext('has attribute required').toBeTrue();
  expect(compiled.querySelector(`label[for='${emailInput.id}']`))
    .withContext(`label for #${emailInput.id}`)
    .toBeTruthy();
  expect(errorsId).withContext('get attribute aria-describedby').toBeTruthy();
  expect(compiled.querySelector(`#${errorsId}`))
    .withContext(`error id #${errorsId}`)
    .toBeTruthy();
};
