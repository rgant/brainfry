import { inject, InjectionToken } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import type { Observable } from 'rxjs';

export type MaybeUser = User | null;
export type MaybeUser$ = Observable<MaybeUser>;

export const USER$ = new InjectionToken<MaybeUser$>(
  'USER$',
  { factory: (): MaybeUser$ => user(inject(Auth)) },
);
