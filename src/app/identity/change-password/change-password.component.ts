import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';

import { USER$ } from '@app/core/user.token';
import type { MaybeUser$ } from '@app/core/user.token';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';
import { createPasswordControl, PASSWORDS } from '../identity-forms';
import { confirmMatch, confirmMatchFormErrors } from '../validators/confirm-match';

type ChangePasswordFormGroup = FormGroup<{
  currentPw: FormControl<string | null>;
  password1: FormControl<string | null>;
  password2: FormControl<string | null>;
}>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  public readonly $currentPwCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $currentPwCntrlInvalid: Signal<boolean>;
  public readonly $errorCode: WritableSignal<string>;
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
  public readonly user$: MaybeUser$;

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
    } = createPasswordControl(true));
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
      confirmMatch('password1', 'password2'),
    );

    this.$formPasswordsInvalid = confirmMatchFormErrors(this.changePasswordForm, this.password1Cntrl, this.password2Cntrl);

    this.$errorCode = signal<string>('');
    this.$showForm = signal<boolean>(true);

    // Not handling non-logged in users because the Route guards should.
    this.user$ = inject(USER$);
  }

  public async onSubmit(user: User): Promise<void> {
    const { currentPw, password1 } = this.changePasswordForm.value;

    // Validators prevent email1 or password being falsey, but TypeScript doesn't know that.
    // Additionally, all users are expected to have an email address.
    if (this.changePasswordForm.invalid || !currentPw || !password1 || !user.email) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
    this.$errorCode.set(''); // Clear out any existing errors

    try {
      const emailCreds = EmailAuthProvider.credential(user.email, currentPw);
      const credentials = await reauthenticateWithCredential(user, emailCreds);
      // const credentials = await signInWithEmailAndPassword(this._auth, user.email ?? '', password);
      await updatePassword(credentials.user, password1);
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
    }

    this.$showForm.set(true);
  }
}
