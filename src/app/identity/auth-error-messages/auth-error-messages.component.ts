import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { InputSignal } from '@angular/core';

/**
 * Default text for these codes come from:
 * https://github.com/firebase/firebase-js-sdk/blob/105d248bd4ddf5d38d5fa7b8a3ec57af2abf459a/packages/auth/src/core/errors.ts
 *
 * The links below are not the correct lists for the client errors!
 * https://firebase.google.com/docs/auth/admin/errors
 * https://firebase.google.com/docs/reference/node/firebase.auth.Error
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-auth-error-messages',
  templateUrl: './auth-error-messages.component.html',
})
export class AuthErrorMessagesComponent {
  /** Firebase Error code */
  // Linter doesn't like aliasing inputs, but also wants Signals called in templates to be prefixed with $
  public readonly $code: InputSignal<string> = input.required();
}
