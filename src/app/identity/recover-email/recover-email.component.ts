import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { Observable } from 'rxjs';

import { SpinnerComponent } from '~/app/shared/spinner/spinner.component';

import { getState } from '../actions/get-state';
import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { RecoverEmailService } from './recover-email.service';
import type { RecoverEmailResults } from './recover-email.service';

/**
 * Reverts Firebase User email change.
 */
@Component({
  selector: 'app-recover-email',
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    RouterLink,
    SpinnerComponent,
  ],
  templateUrl: './recover-email.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoverEmailComponent {
  /**
   * Observable wrapper around the template that performs the actual email recovery and displays the
   * results.
   */
  public readonly vm$: Observable<RecoverEmailResults>;

  private readonly _router: Router;
  private readonly _service: RecoverEmailService;

  /**
   * Gets the current navigation statically to obtain the oobCode from Firebase needed to recover
   * the previous email address for the User.
   */
  constructor() {
    this._router = inject(Router);
    this._service = inject(RecoverEmailService);

    const { oobCode } = getState(this._router.getCurrentNavigation());
    this.vm$ = this._service.recoverEmail$(oobCode);
  }
}
