import { FormControl } from '@angular/forms';

import { passwordStrengthValidator } from './strength.validator';

describe('passwordStrengthValidator', (): void => {
  let control: FormControl;

  beforeEach((): void => {
    control = new FormControl();
  });

  it('should handle empty values', (): void => {
    expect(control.value).toBeNull();
    expect(passwordStrengthValidator(control)).toBeNull();

    control.setValue('');

    expect(passwordStrengthValidator(control)).toBeNull();
  });

  it('should error on incorrect types', (): void => {
    const badValue = 1234;
    control.setValue(badValue);

    expect((): void => { passwordStrengthValidator(control); }).toThrowError("Invalid Control Value Type: 'number'");
  });

  it('should validate weak passwords', (): void => {
    control.setValue('abcd1234');

    expect(passwordStrengthValidator(control)).toEqual({ passwordstrength: 'Weak' });
  });

  it('should allow medium or better passwords', (): void => {
    control.setValue('f8G1f4^4b8');

    expect(passwordStrengthValidator(control)).toBeNull();
  });
});
