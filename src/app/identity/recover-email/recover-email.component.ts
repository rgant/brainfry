import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { Observable } from 'rxjs';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { getState } from '../actions/get-state';
import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { RecoverEmailService } from './recover-email.service';
import type { RecoverEmailResults } from './recover-email.service';

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

    const { oobCode } = getState(this._router.getCurrentNavigation());
    this.vm$ = this._service.recoverEmail$(oobCode);
  }
}
