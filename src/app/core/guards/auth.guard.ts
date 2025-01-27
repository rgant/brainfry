import { inject } from '@angular/core';
import { Auth, user as getUser$ } from '@angular/fire/auth';
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

export const authGuard: CanActivateChildFn = (
  _childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<UrlTree | true> => {
  const auth = inject(Auth);
  const router = inject(Router);
  const { url } = state;

  return getUser$(auth).pipe(
    map((maybeUser: User | null): UrlTree | true => {
      if (!maybeUser) {
        return router.parseUrl(`/login?next=${url}`);
      }

      return true;
    }),
  );
};
