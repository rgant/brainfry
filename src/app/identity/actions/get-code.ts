import type { Navigation } from '@angular/router';

import type { ActionCodeState } from './actions.component';

/**
 * Get the oobCode from the Navigation extras state.
 * If things are missing, return undefined.
 */
export const getCode = (maybeNavigation: Navigation | null): string | undefined => {
  if (maybeNavigation) {
    const { state } = maybeNavigation.extras;
    if (state) {
      const { oobCode }: Partial<ActionCodeState> = state;
      return oobCode;
    }
  }
  return undefined;
};
