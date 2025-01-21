import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';

import { PASSWORDS } from '@app/shared/constants';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { createPasswordControl } from '../identity-forms';
import { passwordsMatch, passwordsMatchFormErrors } from '../validators/passwords.validator';

type ChangePasswordFormGroup = FormGroup<{
  currentPw: FormControl<string | null>;
  password1: FormControl<string | null>;
  password2: FormControl<string | null>;
}>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ ReactiveFormsModule, SpinnerComponent ],
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  public readonly $currentPwCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $currentPwCntrlInvalid: Signal<boolean>;
  public readonly $formPasswordsInvalid: Signal<boolean>;
  public readonly $password1CntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $password1CntrlInvalid: Signal<boolean>;
  public readonly $password2CntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $password2CntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly changePasswordForm: ChangePasswordFormGroup;
  public readonly currentPwCntrl: FormControl<string | null>;
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly password1Cntrl: FormControl<string | null>;
  public readonly password2Cntrl: FormControl<string | null>;

  constructor() {
    ({
      $errors: this.$currentPwCntrlErrors,
      $invalid: this.$currentPwCntrlInvalid,
      control: this.currentPwCntrl,
    } = createPasswordControl());
    ({
      $errors: this.$password1CntrlErrors,
      $invalid: this.$password1CntrlInvalid,
      control: this.password1Cntrl,
    } = createPasswordControl());
    ({
      $errors: this.$password2CntrlErrors,
      $invalid: this.$password2CntrlInvalid,
      control: this.password2Cntrl,
    } = createPasswordControl());

    this.changePasswordForm = new FormGroup(
      {
        currentPw: this.currentPwCntrl,
        password1: this.password1Cntrl,
        password2: this.password2Cntrl,
      },
      passwordsMatch('password1', 'password2'),
    );

    this.$formPasswordsInvalid = passwordsMatchFormErrors(this.changePasswordForm, this.password1Cntrl, this.password2Cntrl);
    this.$showForm = signal<boolean>(true);
  }

  public onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
  }
}
