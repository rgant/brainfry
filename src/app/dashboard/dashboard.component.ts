import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import { USER$ } from '~/app/core/user.token';
import type { MaybeUser } from '~/app/core/user.token';
import { SpinnerComponent } from '~/app/shared/spinner/spinner.component';

@Component({
  selector: 'app-dashboard',
  imports: [ AsyncPipe, SpinnerComponent ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
