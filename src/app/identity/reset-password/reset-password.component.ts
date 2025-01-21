import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';

import { PASSWORDS } from '@app/shared/constants';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { createPasswordControl } from '../identity-forms';
import { passwordsMatch, passwordsMatchFormErrors } from '../validators/passwords.validator';

type ResetPasswordFormGroup = FormGroup<{
  password1: FormControl<string | null>;
  password2: FormControl<string | null>;
}>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ ReactiveFormsModule, SpinnerComponent ],
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  public readonly $formPasswordsInvalid: Signal<boolean>;
  public readonly $password1CntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $password1CntrlInvalid: Signal<boolean>;
  public readonly $password2CntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $password2CntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly password1Cntrl: FormControl<string | null>;
  public readonly password2Cntrl: FormControl<string | null>;
  public readonly resetPasswordForm: ResetPasswordFormGroup;

  constructor() {
    ({
      $errors: this.$password1CntrlErrors,
      $invalid: this.$password1CntrlInvalid,
      control: this.password1Cntrl,
    } = createPasswordControl(true));
    ({
      $errors: this.$password2CntrlErrors,
      $invalid: this.$password2CntrlInvalid,
      control: this.password2Cntrl,
    } = createPasswordControl());

    this.resetPasswordForm = new FormGroup(
      {
        password1: this.password1Cntrl,
        password2: this.password2Cntrl,
      },
      passwordsMatch('password1', 'password2'),
    );

    this.$formPasswordsInvalid = passwordsMatchFormErrors(this.resetPasswordForm, this.password1Cntrl, this.password2Cntrl);
    this.$showForm = signal<boolean>(true);
  }

  public onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
  }
}
