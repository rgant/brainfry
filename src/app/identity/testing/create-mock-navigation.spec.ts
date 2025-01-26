import type { Navigation } from '@angular/router';

/**
 * Produces a partion Navigation object with a Route state containing an oobCode.
 */
export const createMockNavigation = (oobCode: string): Partial<Navigation> => ({ extras: { state: { oobCode } } });
