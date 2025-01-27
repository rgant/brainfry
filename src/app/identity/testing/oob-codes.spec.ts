import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateEmail,
} from '@angular/fire/auth';
import type { Auth, User } from '@angular/fire/auth';

type ActionFunctions = 'sendEmailVerification' | 'sendPasswordResetEmail' | 'updateEmail';

interface EmulatorOobCodes {
  oobCodes: OoBCodePayload[];
}

interface OoBCodePayload {
  email: string; // The original email, to be restored.
  oobCode: string; // Code we need for testing.
  oobLink: string; // Link that would have been sent to the user. Not used.
  requestType: string; // The type of action to perform.
}

const doAction = async (action: Omit<ActionFunctions, 'sendPasswordResetEmail'>, user: User): Promise<void> => {
  switch (action) {
    case 'sendEmailVerification': {
      await sendEmailVerification(user);
      break;
    }

    case 'updateEmail': {
      const newEmail = generateRandomEmail('new');
      await updateEmail(user, newEmail);
      break;
    }
  }
};

const RADIX = 36; // Convert number to string using digits and lower case letters
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Test code, but probably should still not use magic
const generateRandomEmail = (prefix: string): string => `${prefix}-${Math.random().toString(RADIX).slice(2, 6)}@test.email`;

/**
 * https://firebase.google.com/docs/reference/rest/auth#section-auth-emulator-oob
 */
const getOobCodes = async (): Promise<OoBCodePayload[]> => {
  const response = await fetch('http://localhost:9099/emulator/v1/projects/brainfry-app/oobCodes');
  if (response.ok) {
    /* eslint-disable @stylistic/max-len */
    /* Example Data:
     * ```
     * {
     *   "oobCodes": [
     *     {
     *       "email": "556e@411e.89a6",
     *       "oobCode": "m1_RguEvMCXBsLlVxeIQj47AxaNImeHOzpL-jG3cP3Yyf-7JmQ-7fn",
     *       "oobLink": "http://127.0.0.1:9099/emulator/action?mode=recoverEmail&lang=en&oobCode=m1_RguEvMCXBsLlVxeIQj47AxaNImeHOzpL-jG3cP3Yyf-7JmQ-7fn&apiKey=fake-api-key",
     *       "requestType": "RECOVER_EMAIL"
     *     }
     *   ]
     * }
     * ```
     */
    /* eslint-enable @stylistic/max-len */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is test code
    const data: EmulatorOobCodes = await response.json();
    const { oobCodes } = data;
    return oobCodes;
  }
  return [];
};

/**
 * Returns the oobCode requestType for the action.
 * https://firebase.google.com/docs/reference/js/auth.actioncodeinfo#actioncodeinfodata
 */
// eslint-disable-next-line @typescript-eslint/consistent-return -- switch is exhaustive
const getRequestType = (action: ActionFunctions): string => {
  switch (action) {
    case 'sendEmailVerification': {
      return 'VERIFY_EMAIL';
    }

    case 'sendPasswordResetEmail': {
      return 'PASSWORD_RESET';
    }

    case 'updateEmail': {
      return 'RECOVER_EMAIL';
    }
  }
};

export interface TestData {
  oobCode: string;
  originalEmail: string;
  user: User;
}

export const cleanupUsers = async (testUsers: User[]): Promise<void> => {
  await Promise.all(testUsers.map(async (usr: User): Promise<void> => deleteUser(usr)));
};

/**
 * In order to get an oobCode from the emulator we need to actually call the updateEmail method on
 * the test user.
 * Then we can query an endpoint on the emulator to get the current oobCodes, find the correct one
 * and return it to the test.
 */
export const createOobCode = async (auth: Auth, actionFn: ActionFunctions): Promise<TestData> => {
  const originalEmail = generateRandomEmail('orig');
  const password = 'p/V8L5tk15*q';

  // Create a new user for each test so that we don't corrupt the default test users and pollute other tests.
  await createUserWithEmailAndPassword(auth, originalEmail, password);
  // Always sign in the user so we can return it for later cleanup to prevent cross test pollution.
  await signInWithEmailAndPassword(auth, originalEmail, password);
  if (!auth.currentUser) {
    throw new Error('No Current User');
  }

  await (actionFn == 'sendPasswordResetEmail'
    ? sendPasswordResetEmail(auth, originalEmail)
    : doAction(actionFn, auth.currentUser));

  const oobCodeList = await getOobCodes();
  for (const payload of oobCodeList) {
    if (payload.email === originalEmail && payload.requestType === getRequestType(actionFn)) {
      const { oobCode } = payload;
      return { oobCode, originalEmail, user: auth.currentUser };
    }
  }

  throw new Error('Failed to get oobCode');
};
