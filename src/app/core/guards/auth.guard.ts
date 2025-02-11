import { inject } from '@angular/core';
import type { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import type {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import { USER$ } from '../user.token';

/**
 * Requires that there be a currently logged in user to navigate to certain routes.
 * Can be used for both CanActivate and CanActivateChild guards.
 */
export const authGuard: CanActivateChildFn = (
  _childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<UrlTree | true> => {
  const router = inject(Router);
  const user$ = inject(USER$);
  const { url } = state;

  return user$.pipe(
    map((maybeUser: User | null): UrlTree | true => {
      if (!maybeUser) {
        return router.parseUrl(`/login?next=${url}`);
      }

      return true;
    }),
  );
};
