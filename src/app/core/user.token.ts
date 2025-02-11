import { inject, InjectionToken } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import type { Observable } from 'rxjs';

/** The Firebase User object of the currently logged in account, otherwise null. */
export type MaybeUser = User | null;
/** Observable of MaybeUser */
export type MaybeUser$ = Observable<MaybeUser>;

/**
 * Observable of yhe currently logged in Firebase User, or else null.
 */
export const USER$ = new InjectionToken<MaybeUser$>(
  'USER$',
  { factory: (): MaybeUser$ => user(inject(Auth)) },
);
