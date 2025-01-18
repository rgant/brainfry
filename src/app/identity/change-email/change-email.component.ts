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

type ChangeEmailFormGroup = FormGroup<{
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ ReactiveFormsModule, SpinnerComponent ],
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
})
export class ChangeEmailComponent {
  public readonly $emailCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $emailCntrlInvalid: Signal<boolean>;
  public readonly $passwordCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $passwordCntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly changeEmailForm: ChangeEmailFormGroup;
  public readonly emailCntrl: FormControl<string | null>;
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly passwordCntrl: FormControl<string | null>;

  constructor() {
    /* eslint-disable unicorn/no-null -- DOM forms use null */
    this.emailCntrl = new FormControl<string | null>(null, [ Validators.required, Validators.email ]);
    this.passwordCntrl = new FormControl(
      null,
      [
        Validators.required,
        Validators.minLength(this.minPasswordLength),
        Validators.maxLength(this.maxPasswordLength),
      ],
    );
    /* eslint-enable unicorn/no-null */
    this.changeEmailForm = new FormGroup({
      email: this.emailCntrl,
      password: this.passwordCntrl,
    });

    this.$emailCntrlErrors = controlErrorsSignal(this.emailCntrl);
    this.$emailCntrlInvalid = controlInvalidSignal(this.emailCntrl);
    this.$passwordCntrlErrors = controlErrorsSignal(this.passwordCntrl);
    this.$passwordCntrlInvalid = controlInvalidSignal(this.passwordCntrl);
    this.$showForm = signal<boolean>(true);
  }

  public onSubmit(): void {
    if (this.changeEmailForm.invalid) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
  }
}
