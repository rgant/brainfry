import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router, RouterLink } from '@angular/router';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink, SpinnerComponent ],
  selector: 'app-logout',
  templateUrl: './logout.component.html',
})
export class LogoutComponent {
  public readonly $blockWindow: WritableSignal<boolean> = signal<boolean>(false);

  private readonly _auth: Auth = inject(Auth);
  private readonly _router: Router = inject(Router);

  public async logout(): Promise<void> {
    this.$blockWindow.set(true);
    await signOut(this._auth);
    await this._router.navigateByUrl('/'); // Navigate to root to allow Guards to handle final redirecting.
  }
}
