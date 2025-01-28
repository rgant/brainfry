import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import {
  Auth,
  EmailAuthProvider,
  user as getUser$,
  reauthenticateWithCredential,
  updateEmail,
} from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';
import type { Observable } from 'rxjs';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';
import { createEmailControl, createPasswordControl, PASSWORDS } from '../identity-forms';
import { confirmMatch, confirmMatchFormErrors } from '../validators/confirm-match';

type ChangeEmailFormGroup = FormGroup<{
  email1: FormControl<string | null>;
  email2: FormControl<string | null>;
  password: FormControl<string | null>;
}>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
})
export class ChangeEmailComponent {
  public readonly $email1CntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $email1CntrlInvalid: Signal<boolean>;
  public readonly $email2CntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $email2CntrlInvalid: Signal<boolean>;
  public readonly $errorCode: WritableSignal<string>;
  public readonly $formEmailsInvalid: Signal<boolean>;
  public readonly $passwordCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $passwordCntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly changeEmailForm: ChangeEmailFormGroup;
  public readonly email1Cntrl: FormControl<string | null>;
  public readonly email2Cntrl: FormControl<string | null>;
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly passwordCntrl: FormControl<string | null>;
  public readonly user$: Observable<User | null>;

  private readonly _auth: Auth;

  constructor() {
    this._auth = inject(Auth);

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

    this.$errorCode = signal<string>('');
    this.$showForm = signal<boolean>(true);
    // Not handling non-logged in users because the Route guards should.
    this.user$ = getUser$(this._auth);
  }

  public async onSubmit(user: User): Promise<void> {
    const { email1, password } = this.changeEmailForm.value;

    // Validators prevent email1 or password being falsey, but TypeScript doesn't know that.
    // Additionally, all users are expected to have an email address.
    if (this.changeEmailForm.invalid || !email1 || !password || !user.email) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
    this.$errorCode.set(''); // Clear out any existing errors

    try {
      const emailCreds = EmailAuthProvider.credential(user.email, password);
      const credentials = await reauthenticateWithCredential(user, emailCreds);
      // const credentials = await signInWithEmailAndPassword(this._auth, user.email ?? '', password);
      await updateEmail(credentials.user, email1);
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
    }

    this.$showForm.set(true);
  }
}
