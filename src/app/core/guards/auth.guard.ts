import type { ActivatedRouteSnapshot, CanActivateChildFn, RouterStateSnapshot } from '@angular/router';

export const authGuard: CanActivateChildFn = (_childRoute: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean => {
  return true;
};
