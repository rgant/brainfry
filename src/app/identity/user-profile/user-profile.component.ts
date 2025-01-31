/* eslint-disable import-x/max-dependencies -- 11 dependencies */
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { updateProfile } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import type { ValidationErrors } from '@angular/forms';
import { tap } from 'rxjs';

import { USER$ } from '@app/core/user.token';
import type { MaybeUser, MaybeUser$ } from '@app/core/user.token';
import { controlErrorsSignal } from '@app/shared/control-errors-signal.util';
import { controlInvalidSignal } from '@app/shared/control-invalid-signal.util';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';

type ProfileFormGroup = FormGroup<{
  displayName: FormControl<string | null>;
}>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent {
  public readonly $errorCode: WritableSignal<string>;
  public readonly $nameCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $nameCntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly nameCntrl: FormControl<string | null>;
  public readonly profileForm: ProfileFormGroup;
  public readonly user$: MaybeUser$;

  constructor() {
    this.nameCntrl = new FormControl<string | null>(null, Validators.required); // eslint-disable-line unicorn/no-null -- Forms use null
    this.$nameCntrlErrors = controlErrorsSignal(this.nameCntrl);
    this.$nameCntrlInvalid = controlInvalidSignal(this.nameCntrl);

    this.profileForm = new FormGroup({
      displayName: this.nameCntrl,
    });

    this.$errorCode = signal<string>('');
    this.$showForm = signal<boolean>(false);

    // Not handling non-logged in users because the Route guards should.
    this.user$ = inject(USER$).pipe(
      tap({
        next: (user: MaybeUser): void => {
          if (user) {
            this.profileForm.patchValue(user);
            this.$showForm.set(true);
          }
        },
      }),
    );
  }

  public async onSubmit(user: User): Promise<void> {
    const { displayName } = this.profileForm.value;

    // Validators prevent email1 or password being falsey, but TypeScript doesn't know that.
    if (this.profileForm.invalid || !displayName) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
    this.$errorCode.set(''); // Clear out any existing errors

    try {
      await updateProfile(user, { displayName });
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
    }

    this.$showForm.set(true);
  }
}
