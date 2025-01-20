import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import type { ValidationErrors } from '@angular/forms';

import { PASSWORDS } from '@app/shared/constants';
import { controlErrorsSignal } from '@app/shared/control-errors-signal.util';
import { controlInvalidSignal } from '@app/shared/control-invalid-signal.util';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

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
    /* eslint-disable unicorn/no-null -- DOM forms use null */
    this.currentPwCntrl = new FormControl(
      null,
      [
        Validators.required,
        Validators.minLength(this.minPasswordLength),
        Validators.maxLength(this.maxPasswordLength),
      ],
    );
    this.password1Cntrl = new FormControl(
      null,
      [
        Validators.required,
        Validators.minLength(this.minPasswordLength),
        Validators.maxLength(this.maxPasswordLength),
      ],
    );
    this.password2Cntrl = new FormControl(
      null,
      [
        Validators.required,
        Validators.minLength(this.minPasswordLength),
        Validators.maxLength(this.maxPasswordLength),
      ],
    );
    /* eslint-enable unicorn/no-null */
    this.changePasswordForm = new FormGroup({
      currentPw: this.currentPwCntrl,
      password1: this.password1Cntrl,
      password2: this.password2Cntrl,
    });

    this.$currentPwCntrlErrors = controlErrorsSignal(this.currentPwCntrl);
    this.$currentPwCntrlInvalid = controlInvalidSignal(this.currentPwCntrl);
    this.$password1CntrlErrors = controlErrorsSignal(this.password1Cntrl);
    this.$password1CntrlInvalid = controlInvalidSignal(this.password1Cntrl);
    this.$password2CntrlErrors = controlErrorsSignal(this.password2Cntrl);
    this.$password2CntrlInvalid = controlInvalidSignal(this.password2Cntrl);
    this.$showForm = signal<boolean>(true);
  }

  public onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
  }
}
