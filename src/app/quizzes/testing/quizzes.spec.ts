import { DEFAULT_TEST_USER, UNVERIFIED_TEST_USER } from '~/testing/constants';

import type { Quiz } from '../quiz.service';

export const DEFAULT_TEST_USER_QUIZZES: Quiz[] = [
  {
    id: 'xc50KpHTzIe0174GW9rm',
    createdAt: new Date('2025-02-12T17:25:58.752Z'),
    owner: UNVERIFIED_TEST_USER.userId,
    shared: true,
    title: 'Public Quiz',
    updatedAt: new Date('2025-02-12T17:26:03.767Z'),
  },
  {
    id: 'cMxITpaSQaG8DGhnR0pi',
    createdAt: new Date('2025-02-12T17:25:08.945Z'),
    owner: DEFAULT_TEST_USER.userId,
    shared: false,
    title: 'WIP Quiz',
    updatedAt: new Date('2025-02-12T17:25:15.360Z'),
  },
  {
    id: 'SouPDVoZKCT3086dCrej',
    createdAt: new Date('2025-02-12T17:22:55.597Z'),
    owner: DEFAULT_TEST_USER.userId,
    shared: true,
    title: 'Great Quiz',
    updatedAt: new Date('2025-02-12T17:23:02.387Z'),
  },
  {
    id: 'H24LrQQXo6xBP6kqodH2',
    createdAt: new Date('2025-02-12T17:21:48.273Z'),
    owner: DEFAULT_TEST_USER.userId,
    shared: false,
    title: 'Easy Quiz',
    updatedAt: new Date('2025-02-12T17:21:57.165Z'),
  },
];
