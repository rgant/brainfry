import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import type { InputSignal, Signal, WritableSignal } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { SpinnerComponent } from '~/app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';
import { createEmailControl, createPasswordControl, PASSWORDS } from '../identity-forms';

/** Email & password credentials for Authentication */
type LoginFormGroup = FormGroup<{
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}>;

/**
 * Email and password login form.
 */
@Component({
  selector: 'app-login',
  imports: [
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    RouterLink,
    SpinnerComponent,
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  /** Errors specific to the email field. */
  public readonly $emailCntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for email field. */
  public readonly $emailCntrlInvalid: Signal<boolean>;
  /** Login form error response code. */
  public readonly $errorCode: WritableSignal<string>;
  /** Errors specific to the password field. */
  public readonly $passwordCntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for password field. */
  public readonly $passwordCntrlInvalid: Signal<boolean>;
  /** Toggle Login form and spinner. */
  public readonly $showForm: WritableSignal<boolean>;
  public readonly emailCntrl: FormControl<string | null>;
  public readonly loginForm: LoginFormGroup;
  /** Used in error message for password maximum length. */
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  /** Used in error message for password minimum length. */
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  /**
   * Navigate to root to allow default redirectTo Route to decide initial destination unless the
   * `next` query parameter is set.
   */
  public readonly next: InputSignal<string> = input<string>('/');
  public readonly passwordCntrl: FormControl<string | null>;

  private readonly _auth: Auth;
  private readonly _router: Router = inject(Router);

  constructor() {
    this._auth = inject(Auth);

    ({ $errors: this.$emailCntrlErrors, $invalid: this.$emailCntrlInvalid, control: this.emailCntrl } = createEmailControl());
    ({ $errors: this.$passwordCntrlErrors, $invalid: this.$passwordCntrlInvalid, control: this.passwordCntrl } = createPasswordControl());
    this.$showForm = signal<boolean>(true);

    this.loginForm = new FormGroup({
      email: this.emailCntrl,
      password: this.passwordCntrl,
    });

    this.$errorCode = signal<string>('');
  }

  /**
   * Login using credentials and then redirect to next view.
   */
  public async onSubmit(): Promise<void> {
    const { email, password } = this.loginForm.value;

    // Validators prevent email or password being falsy, but TypeScript doesn't know that.
    if (this.loginForm.invalid || !email || !password) {
      throw new Error('Invalid form submitted');
    }

    this.$errorCode.set(''); // Clear out any existing errors
    this.$showForm.set(false);

    try {
      await signInWithEmailAndPassword(this._auth, email, password);
      await this._router.navigateByUrl(this.next());
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
      this.$showForm.set(true);
    }
  }
}
