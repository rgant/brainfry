import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

// These should match [Password Policy](/docs/firebase-manual-config.md#update-the-configuration)
const MAX_PASSWORD_LENGTH = 4096; // Glyphs, Firebase default maximum
const MIN_PASSWORD_LENGTH = 12; // Glyphs

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
  public readonly emailCntrl: FormControl<string | null>;
  public readonly loginForm: LoginFormGroup;
  public readonly maxPasswordLength: number = MAX_PASSWORD_LENGTH;
  public readonly minPasswordLength: number = MIN_PASSWORD_LENGTH;
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
    this.loginForm = new FormGroup({
      email: this.emailCntrl,
      password: this.passwordCntrl,
    });
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      throw new Error('Invalid form submitted');
    }
  }
}
