import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
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

export const emailVerifiedGuard: CanActivateChildFn = (
  _childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<UrlTree | boolean> => {
  const auth = inject(Auth);
  const router = inject(Router);
  const { url } = state;

  return user(auth).pipe(
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
