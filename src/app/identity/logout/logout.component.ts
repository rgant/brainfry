import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink ],
  selector: 'app-logout',
  styleUrl: './logout.component.scss',
  templateUrl: './logout.component.html',
})
export class LogoutComponent {
  private readonly _authService: Auth = inject(Auth);
  private readonly _router: Router = inject(Router);

  public async logout(): Promise<void> {
    await signOut(this._authService);
    await this._router.navigateByUrl('/');
  }
}
