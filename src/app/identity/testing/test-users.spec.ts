import type { Auth, User } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';

export const cleanupUsers = async (auth: Auth, testUsers: User[]): Promise<void> => {
  // Prevent cross test pollution because it seems users can remain logged in across tests.
  await signOut(auth);
  await Promise.all(testUsers.map(async (usr: User): Promise<void> => deleteUser(usr)));
};

export const createAndSignInUser = async (auth: Auth): Promise<User> => {
  const originalEmail = generateRandomEmail('orig');

  // Create a new user for each test so that we don't corrupt the default test users and pollute other tests.
  await createUserWithEmailAndPassword(auth, originalEmail, TEST_USER_PASSWORD);
  // Always sign in the user so we can return it for later cleanup to prevent cross test pollution.
  const credentials = await signInWithEmailAndPassword(auth, originalEmail, TEST_USER_PASSWORD);
  if (!auth.currentUser) {
    throw new Error('No Current Test User');
  }
  return credentials.user;
};

const RADIX = 36; // Convert number to string using digits and lower case letters
const SKIP_WHOLE_NUM = 2;
const END_INDEX = 8; // END_INDEX - SKIP_WHOLE_NUM = Total length of 6
export const generateRandomEmail = (prefix: string): string =>
  `${prefix}-${Math.random().toString(RADIX).slice(SKIP_WHOLE_NUM, END_INDEX)}@test.email`;

export const TEST_USER_PASSWORD = 'p/V8L5tk15*q';
