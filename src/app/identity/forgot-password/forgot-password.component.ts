import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { createEmailControl } from '../identity-forms';

type ForgotFormGroup = FormGroup<{ email: FormControl<string | null> }>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ ReactiveFormsModule, RouterLink, SpinnerComponent ],
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  public readonly $emailCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $emailCntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly emailCntrl: FormControl<string | null>;
  public readonly forgotForm: ForgotFormGroup;

  constructor() {
    ({ $errors: this.$emailCntrlErrors, $invalid: this.$emailCntrlInvalid, control: this.emailCntrl } = createEmailControl());

    this.forgotForm = new FormGroup({ email: this.emailCntrl });
    this.$showForm = signal<boolean>(true);
  }

  public onSubmit(): void {
    if (this.forgotForm.invalid) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
  }
}
