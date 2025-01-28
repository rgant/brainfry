import { sendEmailVerification, sendPasswordResetEmail, updateEmail } from '@angular/fire/auth';
import type { Auth, User } from '@angular/fire/auth';

import { cleanupUsers, createAndSignInUser, generateRandomEmail } from './test-users.spec';

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

export { cleanupUsers };

/**
 * In order to get an oobCode from the emulator we need to actually call the updateEmail method on
 * the test user.
 * Then we can query an endpoint on the emulator to get the current oobCodes, find the correct one
 * and return it to the test.
 */
export const createOobCode = async (auth: Auth, actionFn: ActionFunctions): Promise<TestData> => {
  const user = await createAndSignInUser(auth);
  const originalEmail = user.email;

  if (!originalEmail) {
    throw new Error('Test User without email');
  }

  await (actionFn == 'sendPasswordResetEmail'
    ? sendPasswordResetEmail(auth, originalEmail)
    : doAction(actionFn, user));

  const oobCode = await findOobCode(originalEmail, actionFn);
  if (oobCode) {
    return { oobCode, originalEmail, user };
  }

  throw new Error('Failed to get oobCode');
};

export const findOobCode = async (email: string, actionFn: ActionFunctions): Promise<string> => {
  const oobCodeList = await getOobCodes();
  for (const payload of oobCodeList) {
    if (payload.email === email && payload.requestType === getRequestType(actionFn)) {
      const { oobCode } = payload;
      return oobCode;
    }
  }
  return '';
};
