import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';
import { createEmailControl } from '../identity-forms';

type ForgotFormGroup = FormGroup<{ email: FormControl<string | null> }>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    RouterLink,
    SpinnerComponent,
  ],
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  public readonly $emailCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $emailCntrlInvalid: Signal<boolean>;
  public readonly $errorCode: WritableSignal<string>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly emailCntrl: FormControl<string | null>;
  public readonly forgotForm: ForgotFormGroup;

  private readonly _auth: Auth;

  constructor() {
    this._auth = inject(Auth);

    ({ $errors: this.$emailCntrlErrors, $invalid: this.$emailCntrlInvalid, control: this.emailCntrl } = createEmailControl());

    this.forgotForm = new FormGroup({ email: this.emailCntrl });

    this.$errorCode = signal<string>('');
    this.$showForm = signal<boolean>(true);
  }

  public async onSubmit(): Promise<void> {
    const { email } = this.forgotForm.value;

    // Validators prevent email being falsey, but TypeScript doesn't know that.
    if (this.forgotForm.invalid || !email) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
    this.$errorCode.set(''); // Clear out any existing errors

    try {
      await sendPasswordResetEmail(this._auth, email);
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
    }

    this.$showForm.set(true);
  }
}
