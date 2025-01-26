import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { createEmailControl, createPasswordControl, PASSWORDS } from '../identity-forms';
import { confirmMatch, confirmMatchFormErrors } from '../validators/confirm-match';

type ChangeEmailFormGroup = FormGroup<{
  email1: FormControl<string | null>;
  email2: FormControl<string | null>;
  password: FormControl<string | null>;
}>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ ReactiveFormsModule, SpinnerComponent ],
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
})
export class ChangeEmailComponent {
  public readonly $email1CntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $email1CntrlInvalid: Signal<boolean>;
  public readonly $email2CntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $email2CntrlInvalid: Signal<boolean>;
  public readonly $formEmailsInvalid: Signal<boolean>;
  public readonly $passwordCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $passwordCntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly changeEmailForm: ChangeEmailFormGroup;
  public readonly email1Cntrl: FormControl<string | null>;
  public readonly email2Cntrl: FormControl<string | null>;
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly oldEmail: string = 'TODO';
  public readonly passwordCntrl: FormControl<string | null>;

  constructor() {
    ({ $errors: this.$email1CntrlErrors, $invalid: this.$email1CntrlInvalid, control: this.email1Cntrl } = createEmailControl());
    ({ $errors: this.$email2CntrlErrors, $invalid: this.$email2CntrlInvalid, control: this.email2Cntrl } = createEmailControl());
    ({ $errors: this.$passwordCntrlErrors, $invalid: this.$passwordCntrlInvalid, control: this.passwordCntrl } = createPasswordControl());

    this.changeEmailForm = new FormGroup(
      {
        email1: this.email1Cntrl,
        email2: this.email2Cntrl,
        password: this.passwordCntrl,
      },
      confirmMatch('email1', 'email2'),
    );

    this.$formEmailsInvalid = confirmMatchFormErrors(this.changeEmailForm, this.email1Cntrl, this.email2Cntrl);

    this.$showForm = signal<boolean>(true);
  }

  public onSubmit(): void {
    if (this.changeEmailForm.invalid) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
  }
}
