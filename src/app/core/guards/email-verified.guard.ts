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

export const emailVerifiedGuard: CanActivateChildFn = (
  _childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<UrlTree | boolean> => {
  const router = inject(Router);
  const user$ = inject(USER$);
  const { url } = state;

  return user$.pipe(
    map((maybeUser: User | null): UrlTree | boolean => {
      if (!maybeUser) {
        return false;
      }

      if (!maybeUser.emailVerified) {
        return router.parseUrl(`/confirm-email?next=${url}`);
      }

      return true;
    }),
  );
};
