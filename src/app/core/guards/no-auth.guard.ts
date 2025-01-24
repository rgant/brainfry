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

export const noAuthGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
): Observable<UrlTree | true> => {
  const auth = inject(Auth);
  const router = inject(Router);
  /** Navigate to the `next` query parameter if set, else to the root and allow default redirectTo Route to decide initial destination. */
  const nextUrl = childRoute.queryParamMap.get('next') ?? '/';

  return user(auth).pipe(
    map((maybeUser: User | null): UrlTree | true => {
      if (maybeUser) {
        return router.parseUrl(nextUrl);
      }

      return true;
    }),
  );
};
