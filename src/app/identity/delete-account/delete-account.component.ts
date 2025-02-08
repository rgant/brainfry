import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import type { ElementRef, Signal, WritableSignal } from '@angular/core';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { FormControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

import { USER$ } from '@app/core/user.token';
import type { MaybeUser$ } from '@app/core/user.token';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';
import { createPasswordControl, PASSWORDS } from '../identity-forms';

type DeleteAccountFormGroup = FormGroup<{
  password: FormControl<string | null>;
}>;

type DialogRef = ElementRef<HTMLDialogElement>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
})
export class DeleteAccountComponent {
  public readonly $errorCode: WritableSignal<string>;
  public readonly $passwordCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $passwordCntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly deleteAccountForm: DeleteAccountFormGroup;
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  public readonly minPasswordLength: number = PASSWORDS.minLength;
  public readonly passwordCntrl: FormControl<string | null>;
  public readonly user$: MaybeUser$;

  private readonly _$confirmDialog: Signal<DialogRef> = viewChild.required<DialogRef>('confirmDialog');
  private readonly _router: Router;

  constructor() {
    this._router = inject(Router);

    ({
      $errors: this.$passwordCntrlErrors,
      $invalid: this.$passwordCntrlInvalid,
      control: this.passwordCntrl,
    } = createPasswordControl());

    this.deleteAccountForm = new FormGroup({
      password: this.passwordCntrl,
    });

    this.$errorCode = signal<string>('');
    this.$showForm = signal<boolean>(true);

    // Not handling non-logged in users because the Route guards should.
    this.user$ = inject(USER$);
  }

  public closeDialog(): void {
    const dialogEl = this._$confirmDialog();
    dialogEl.nativeElement.close();
  }

  public async deleteAcount(user: User): Promise<void> {
    // The dialog automatically closes on submit. event.preventDefault() and event.stopPropagation() do not prevent that.
    const { password } = this.deleteAccountForm.value;

    // Validators prevent email1 or password being falsey, but TypeScript doesn't know that.
    // Additionally, all users are expected to have an email address.
    if (this.deleteAccountForm.invalid || !password || !user.email) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
    this.$errorCode.set(''); // Clear out any existing errors

    try {
      const emailCreds = EmailAuthProvider.credential(user.email, password);
      const credentials = await reauthenticateWithCredential(user, emailCreds);
      await deleteUser(credentials.user);
      await this._router.navigateByUrl('/');
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
    }

    this.$showForm.set(true);
  }

  public openDialog(): void {
    const dialogEl = this._$confirmDialog();
    this.$errorCode.set(''); // Clear out any existing errors
    dialogEl.nativeElement.showModal();
  }
}
