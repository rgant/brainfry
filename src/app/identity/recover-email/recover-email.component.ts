import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { Navigation } from '@angular/router';
import type { Observable } from 'rxjs';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import type { ActionCodeState } from '../actions/actions.component';
import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { RecoverEmailService } from './recover-email.service';
import type { RecoverEmailResults } from './recover-email.service';

/**
 * Get the oobCode from the Navigation extras state.
 * If things are missing, return undefined.
 */
const getCode = (maybeNavigation: Navigation | null): string | undefined => {
  if (maybeNavigation) {
    const { state } = maybeNavigation.extras;
    if (state) {
      const { oobCode }: Partial<ActionCodeState> = state;
      return oobCode;
    }
  }
  return undefined;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    RouterLink,
    SpinnerComponent,
  ],
  selector: 'app-recover-email',
  templateUrl: './recover-email.component.html',
})
export class RecoverEmailComponent {
  public readonly vm$: Observable<RecoverEmailResults>;

  private readonly _router: Router;
  private readonly _service: RecoverEmailService;

  constructor() {
    this._router = inject(Router);
    this._service = inject(RecoverEmailService);
    this.vm$ = this._service.recoverEmail$(getCode(this._router.getCurrentNavigation()));
  }
}
