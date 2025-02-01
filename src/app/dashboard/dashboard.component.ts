import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import { USER$ } from '@app/core/user.token';
import type { MaybeUser } from '@app/core/user.token';
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

  constructor() {
    const user$ = inject(USER$);

    this.name$ = user$.pipe(
      map((maybeUser: MaybeUser): string => maybeUser?.displayName ?? 'You'),
    );
  }
}
