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
 * Requires that there not be a currently logged in user to navigate to certain routes.
 * For example, routes that are for logging in and recovering accounts.
 * Can be used for both CanActivate and CanActivateChild guards.
 */
export const noAuthGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
): Observable<UrlTree | true> => {
  const router = inject(Router);
  // Navigate to the `next` query parameter if set, else to the root and allow default redirectTo Route to decide initial destination.
  const nextUrl = childRoute.queryParamMap.get('next') ?? '/';
  const user$ = inject(USER$);

  return user$.pipe(
    map((maybeUser: User | null): UrlTree | true => {
      if (maybeUser) {
        return router.parseUrl(nextUrl);
      }

      return true;
    }),
  );
};
