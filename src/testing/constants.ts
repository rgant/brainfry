import { Timestamp } from '@angular/fire/firestore';

export const DEFAULT_TEST_USER = {
  email: '556e@411e.89a6',
  password: 'b567CCe6-86f(8b36#26b',
  userId: 'Sl45PFWdkVGpgfySJutci0ZrcL5v',
} as const;

export const UNVERIFIED_TEST_USER = {
  email: '908a@40c2.b893',
  password: '2bdAAfa&-8Dafcd9)6*e3',
  userId: 'icZzOwJNDPA6euJL8RLt5wN0rEnH',
} as const;

/* eslint-disable @typescript-eslint/no-magic-numbers */
const now = new Date(2014, 3, 16, 9, 24, 12, 201);
const past = new Date(2014, 2, 21, 14, 42, 15, 446);
/* eslint-enable @typescript-eslint/no-magic-numbers */

export const TEST_DATES = {
  now,
  nowTs: Timestamp.fromDate(now),
  past,
  pastTs: Timestamp.fromDate(past),
} as const;
