import type { Navigation } from '@angular/router';

import type { ActionCodeState } from './actions.component';

/**
 * Get the ActionCodeState from the Navigation extras state, if we can.
 */
export const getState = (maybeNavigation: Navigation | null): Partial<ActionCodeState> =>
  maybeNavigation?.extras.state ?? {};
