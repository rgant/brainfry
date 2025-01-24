import type { ComponentFixture } from '@angular/core/testing';
import type { FormControl } from '@angular/forms';

import { getCompiled, safeQuerySelector } from '@testing/utilities';

export const ariaInvalidTest = (
  control: FormControl<string | null>,
  fixture: ComponentFixture<unknown>,
  fieldId: string,
): void => {
  const compiled: HTMLElement = getCompiled(fixture);
  const emailInput: HTMLInputElement = safeQuerySelector(compiled, `#${fieldId}`);

  expect(control.invalid).withContext('FormControl.invalid').toBe(true);
  expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

  control.markAsDirty();
  control.markAsTouched();
  fixture.detectChanges();

  // When invalid, dirty, and touched
  expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('true');

  // When not one of invalid, dirty, or touched

  // Touched
  control.markAsUntouched();
  fixture.detectChanges();

  expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

  control.markAsTouched();

  // Dirty
  control.markAsPristine();
  fixture.detectChanges();

  expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

  control.markAsDirty();

  // Invalid
  control.setErrors(null); // eslint-disable-line unicorn/no-null -- FormControl.errors use null
  fixture.detectChanges();

  expect(emailInput.getAttribute('aria-invalid')).withContext('get attribute aria-invalid').toBe('false');

  control.setErrors({ required: true });
  // Not really necessary to `setErrors` again as this is the end of the test, but it follows the pattern above.
};
