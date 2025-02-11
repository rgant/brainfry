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

/** Deleting a Firebase User requires a recent authentication. */
type DeleteAccountFormGroup = FormGroup<{
  password: FormControl<string | null>;
}>;

/** Template reference to HTML dialog element. */
type DialogRef = ElementRef<HTMLDialogElement>;

/**
 * Two step process to delete a User's account in Firebase Authentication. First button opens a
 * dialog where the User enters their password and confirms account deletion.
 */
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
  /** Errors from Firebase, displayed after the dialog is closed. */
  public readonly $errorCode: WritableSignal<string>;
  /** Errors specific to the password field. */
  public readonly $passwordCntrlErrors: Signal<ValidationErrors | undefined>;
  /** Aria-invalid attribute for the password field. */
  public readonly $passwordCntrlInvalid: Signal<boolean>;
  /** Toggle showing view and the spinner. */
  public readonly $showForm: WritableSignal<boolean>;
  public readonly deleteAccountForm: DeleteAccountFormGroup;
  /** Used in error message for password maximum length. */
  public readonly maxPasswordLength: number = PASSWORDS.maxLength;
  /** Used in error message for password minimum length. */
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

  /**
   * Closes the HTML Dialog element without deleting the account.
   */
  public closeDialog(): void {
    const dialogEl = this._$confirmDialog();
    dialogEl.nativeElement.close();
  }

  /**
   * Re-authenticates the User using their password from the form, and then deletes the User in
   * Firebase Authentication.
   */
  public async deleteAcount(user: User): Promise<void> {
    // The dialog automatically closes on submit. event.preventDefault() and event.stopPropagation() do not prevent that.
    const { password } = this.deleteAccountForm.value;

    // Validators prevent email1 or password being falsy, but TypeScript doesn't know that.
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

  /**
   * Opens the HTML Dialog containing the delete account form.
   */
  public openDialog(): void {
    const dialogEl = this._$confirmDialog();
    this.$errorCode.set(''); // Clear out any existing errors
    dialogEl.nativeElement.showModal();
  }
}
