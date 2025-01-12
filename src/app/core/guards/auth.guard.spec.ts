import { TestBed } from '@angular/core/testing';
import type {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  GuardResult,
  MaybeAsync,
  RouterStateSnapshot,
} from '@angular/router';

import { authGuard } from './auth.guard';

const executeGuard: CanActivateChildFn = (...guardParameters: [ ActivatedRouteSnapshot, RouterStateSnapshot ]): MaybeAsync<GuardResult> =>
  TestBed.runInInjectionContext((): MaybeAsync<GuardResult> => authGuard(...guardParameters));

describe('authGuard', (): void => {
  beforeEach((): void => {
    TestBed.configureTestingModule({});
  });

  it('should be created', (): void => {
    expect(executeGuard).toBeTruthy();
  });
});
