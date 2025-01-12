import type { ActivatedRouteSnapshot, CanActivateChildFn, RouterStateSnapshot } from '@angular/router';

export const noAuthGuard: CanActivateChildFn = (_childRoute: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean => {
  return true;
};
