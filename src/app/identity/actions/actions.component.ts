import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import type { InputSignal, Signal } from '@angular/core';
import { Router } from '@angular/router';

import { SpinnerComponent } from '~/app/shared/spinner/spinner.component';

/**
 * https://firebase.google.com/docs/reference/js/auth.actioncodeurl
 */
export interface ActionCodeState {
  /** We may include a next url when verifying email. */
  readonly continueUrl: string | undefined;
  /** Currently not used, but the language code of the email sent to with the oobCode. */
  readonly lang: string | undefined;
  /** Action to be performed by the oobCode. */
  readonly mode: string | undefined;
  /** Out of Band Code to perform sensitive Authentication action. */
  readonly oobCode: string;
}

/**
 * Firebase Action continueUrl is fully qualified. If it has a value convert it into a relative URL.
 */
const cleanUrl = (continueUrl: string | undefined): string | undefined => {
  if (continueUrl) {
    const url = new URL(continueUrl);
    return `${url.pathname}${url.search}${url.hash}`;
  }
  return undefined;
};

/**
 * Self handle Firebase Authentication Actions
 * https://firebase.google.com/docs/auth/custom-email-handler
 *
 * Strips the query string parameters from the URL and stores them in the Router state for the
 * specific Components to handle.
 */
@Component({
  selector: 'app-actions',
  imports: [ SpinnerComponent ],
  template: '<app-spinner class="modal-block" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsComponent {
  /** Query parameter from Firebase Authentication link. */
  public readonly continueUrl: InputSignal<string | undefined> = input<string>();
  /** Query parameter from Firebase Authentication link. */
  public readonly lang: InputSignal<string | undefined> = input<string>();
  /** Query parameter from Firebase Authentication link. */
  public readonly mode: InputSignal<string> = input.required<string>();
  /** Query parameter from Firebase Authentication link. */
  public readonly oobCode: InputSignal<string> = input.required<string>();

  private readonly _$actionState: Signal<Partial<ActionCodeState>>;
  private readonly _modePaths: Record<string, string>;
  private readonly _router: Router;

  /**
   * Collects the Firebase action codes from the URL query parameters and stores them in the router
   * state.
   * Maps Firebase action mode to our specific Components for handling the sensitive actions.
   * Replaces this URL in the history stack to prevent reverse navigation from attepting to apply
   * the code again.
   */
  constructor() {
    this._$actionState = computed((): Partial<ActionCodeState> => ({
      continueUrl: cleanUrl(this.continueUrl()),
      lang: this.lang(),
      mode: this.mode(),
      oobCode: this.oobCode(),
    }));
    this._modePaths = {
      recoverEmail: '/recover-email',
      resetPassword: '/reset-password',
      verifyAndChangeEmail: '/verify-email',
      verifyEmail: '/verify-email',
    };
    this._router = inject(Router);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This works, for now, but perhaps not in the future!
    effect(async (): Promise<void> => {
      const state = this._$actionState();

      if (state.mode && state.oobCode) {
        const path = this._modePaths[state.mode];

        if (path) {
          // If this promise is not awaited then test cases fail :-(
          await this._router.navigateByUrl(path, { replaceUrl: true, state });
        } else {
          console.error(`Unknown mode '${state.mode}'`);
        }
      } else {
        if (!state.mode) {
          console.error('Missing ActionCodeSettings#mode');
        }
        if (!state.oobCode) {
          console.error('Missing ActionCodeSettings#oobCode');
        }
      }

      // Something about this action is invalid.
      // Navigate to root to allow default redirectTo Route to decide initial destination.
      await this._router.navigateByUrl('/', { replaceUrl: true });
    });
  }
}
