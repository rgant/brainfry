import type { Navigation } from '@angular/router';

import type { ActionCodeState } from '../actions/actions.component';
/**
 * Produces a partion Navigation object with a Route state containing an oobCode.
 */
export const createMockNavigation = (actionCodeState: Partial<ActionCodeState>): Partial<Navigation> =>
  ({ extras: { state: { ...actionCodeState } } });
