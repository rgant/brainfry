import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ AsyncPipe, SpinnerComponent ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.scss',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  public readonly name$: Observable<string>;

  private readonly _auth: Auth;

  constructor() {
    this._auth = inject(Auth);

    this.name$ = user(this._auth).pipe(
      map((maybeUser: User | null): string => maybeUser?.displayName ?? 'You'),
    );
  }
}
