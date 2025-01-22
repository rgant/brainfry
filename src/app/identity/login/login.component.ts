import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PASSWORDS } from '@app/shared/constants';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { createEmailControl, createPasswordControl } from '../identity-forms';

type LoginFormGroup = FormGroup<{
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ ReactiveFormsModule, RouterLink, SpinnerComponent ],
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  public readonly $emailCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $emailCntrlInvalid: Signal<boolean>;
  public readonly $passwordCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $passwordCntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly emailCntrl: FormControl<string | null>;
  public readonly loginForm: LoginFormGroup;
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly passwordCntrl: FormControl<string | null>;

  private readonly _auth: Auth;
  private readonly _router: Router = inject(Router);

  constructor() {
    this._auth = inject(Auth);

    ({ $errors: this.$emailCntrlErrors, $invalid: this.$emailCntrlInvalid, control: this.emailCntrl } = createEmailControl());
    ({ $errors: this.$passwordCntrlErrors, $invalid: this.$passwordCntrlInvalid, control: this.passwordCntrl } = createPasswordControl());

    this.loginForm = new FormGroup({
      email: this.emailCntrl,
      password: this.passwordCntrl,
    });

    this.$showForm = signal<boolean>(true);
  }

  public async onSubmit(): Promise<void> {
    const { email, password } = this.loginForm.value;

    // Validators prevent email or password being falsey, but TypeScript doesn't know that.
    if (this.loginForm.invalid || !email || !password) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);

    await signInWithEmailAndPassword(this._auth, email, password);
    await this._router.navigateByUrl('/'); // Navigate to root to allow default redirectTo Route to decide initial destination
  }
}
