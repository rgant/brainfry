/**
 * Self handle Firebase Authentication Actions
 * https://firebase.google.com/docs/auth/custom-email-handler
 */
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

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

/**
 * https://firebase.google.com/docs/reference/js/auth.actioncodeurl
 */
export interface ActionCodeState {
  continueUrl?: string;
  lang?: string;
  mode: string;
  oobCode: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ SpinnerComponent ],
  selector: 'app-actions',
  template: '<app-spinner class="modal-block" />',
})
export class ActionsComponent {
  public readonly continueUrl: InputSignal<string | undefined> = input<string>();
  public readonly lang: InputSignal<string | undefined> = input<string>();
  public readonly mode: InputSignal<string | undefined> = input<string>();
  public readonly oobCode: InputSignal<string | undefined> = input<string>();

  private readonly _$actionState: Signal<Partial<ActionCodeState>>;
  private readonly _modePaths: Record<string, string>;
  private readonly _router: Router;

  constructor() {
    this._$actionState = computed((): Partial<ActionCodeState> => ({
      continueUrl: this.continueUrl(),
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

      if (state.continueUrl) {
        const url = new URL(state.continueUrl);
        state.continueUrl = `${url.pathname}${url.search}${url.hash}`;
      }

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
