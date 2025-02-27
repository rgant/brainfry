import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';
import type { DocumentData, WithFieldValue } from '@angular/fire/firestore';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import type { RulesTestContext, RulesTestEnvironment } from '@firebase/rules-unit-testing';

import firebaseSettings from '../../firebase.json';
import type { PromiseRejecter, PromiseResolver } from './promise-methods';

/** Keys for the emulators objects in firebase.json */
type EmulatorKeys = Exclude<keyof typeof firebaseSettings.emulators, 'singleProjectMode'>;

/** Settings for TestEnvironmentConfig / Firebase Emulators Config */
interface HostAndPort {
  host: string;
  port: number;
}

/** Because we aren't `target`ing `es2024` in tsconfig we need to provide types for Promise.withResolvers. */
interface WithResolvers<T> {
  promise: Promise<T>;
  reject: PromiseRejecter;
  resolve: PromiseResolver<T>;
}

/** Emulators run on localhost IP by default. */
const LOCALHOST = '127.0.0.1';

/** Gets the configuration for an emulator from firebase.json emulators. */
const getHostAndPort = (key: EmulatorKeys): HostAndPort => {
  const config: { host?: string; port: number } = firebaseSettings.emulators[key];
  return {
    host: config.host ?? LOCALHOST,
    port: config.port,
  };
};

/**
 * Owner level access to the Firestore emulator to access documents in testing without firestore.rules
 * applying.
 */
export class NoRulesFirestore {
  constructor(
    public readonly collectionName: string,
    public readonly testEnv: RulesTestEnvironment,
  ) {}

  /**
   * Should be called in a `beforeAll` in a test suite:
   *
   * ```ts
   * beforeAll(async (): Promise<void> => {
   *   ownerFirestore = NoRulesFirestore.initialize(COLLECTION_NAME);
   * });
   * ```
   *
   * Also remember to cleanup:
   *
   * ```
   * afterAll(async (): Promise<void> => {
   *  await ownerFirestore.testEnv.cleanup();
   * });
   * ```
   */
  public static async initialize(collectionName: string): Promise<NoRulesFirestore> {
    const testEnv = await initializeTestEnvironment({
      // @firebase/rules-unit-testing assumes it is running in a node.js environment, but Angular
      // is running in a browser with webpack and so `process is not defined` will be thrown here
      // unless _every_ configuration is set so the code doesn't try to load one using environment
      // variables.
      // Also note that in order to add debugging statements to node_modules/@firebase/rules-unit-testing/dist/esm/index.esm.js
      // that will actually be picked up by webpack you need to run `ng cache clean` after every
      // change.
      // Appears unlikely the tool will support browsers: https://github.com/firebase/firebase-js-sdk/issues/8795
      database: {
        // Not actually using the Realtime Database
        host: LOCALHOST,
        port: 9000,
      },
      firestore: getHostAndPort('firestore'),
      hub: {
        // `firebase emulators:exec --import ./fixtures/firebase-emulator/ --only auth,firestore,storage 'env' | grep FIREBASE_EMULATOR_HUB`
        host: LOCALHOST,
        port: 4400,
      },
      projectId: 'brainfry-app',
      storage: getHostAndPort('storage'),
    });

    return new NoRulesFirestore(collectionName, testEnv);
  }

  /**
   * Create a new document in Firestore as the owner without applying rules.
   * @returns - The new Document ID.
   */
  public async createDocument(payload: DocumentData): Promise<string> {
    return this._withNoRulesContext(async (noRulesContext: RulesTestContext): Promise<string> => {
      const db = noRulesContext.firestore();
      const collectionRef = collection(db, this.collectionName);
      const docRef = await addDoc(collectionRef, payload);
      return docRef.id;
    });
  }

  /**
   * Delete a document in Firestore as the owner without applying rules.
   * @param id - Document ID
   */
  public async deleteDocument(id: string): Promise<void> {
    return this._withNoRulesContext(async (noRulesContext: RulesTestContext): Promise<void> => {
      const db = noRulesContext.firestore();
      const documentRef = doc(db, this.collectionName, id);
      await deleteDoc(documentRef);
    });
  }

  /**
   * Read a document in Firestore as the owner without applying rules.
   * @param id - Document ID
   * @returns - The document data, or undefined if it doesn't exist. Note that with rules missing
   *            documents would throw exceptions.
   */
  public async fetchDocument(id: string): Promise<DocumentData | undefined> {
    return this._withNoRulesContext(async (noRulesContext: RulesTestContext): Promise<DocumentData | undefined> => {
      const db = noRulesContext.firestore();
      const documentRef = doc(db, this.collectionName, id);
      const snapshot = await getDoc(documentRef);
      return snapshot.data();
    });
  }

  /**
   * Update a document in Firestore as the owner without applying rules.
   * @param id - Document ID
   * @param payload - The changes to the document, possibly including FieldValues.
   */
  public async updateDocument(id: string, payload: WithFieldValue<DocumentData>): Promise<void> {
    return this._withNoRulesContext(async (noRulesContext: RulesTestContext): Promise<void> => {
      const db = noRulesContext.firestore();
      const documentRef = doc(db, this.collectionName, id);
      await updateDoc(documentRef, payload);
    });
  }

  /**
   * Handles running the Firestore operations inside of the No Rules Context. `@firebase/rules-unit-testing`
   * makes this extra complicated because it fears developers using this in production. So instead
   * they have made testing harder. Which is not a trade off I would have made.
   *
   * Note, it would be nice if `implementation`'s parameter was the Firestore database object instead
   * of the RulesTestContext. But that requires access to the `firebase.firestore.Firestore` type,
   * and I don't know how to import that directly. The type from `@angular/fire/firestore` is not
   * compatible.
   */
  private async _withNoRulesContext<T>(implementation: (noRulesContext: RulesTestContext) => Promise<T>): Promise<T> {
    // @ts-expect-error needs lib es2024
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const { promise, reject, resolve }: WithResolvers<T> = Promise.withResolvers();

    const callbackPromise = async (noRulesContext: RulesTestContext): Promise<void> => {
      try {
        const ret = await implementation(noRulesContext);
        resolve(ret);
      } catch (err: unknown) {
        reject(err);
      }
    };

    await this.testEnv.withSecurityRulesDisabled(callbackPromise);

    return promise;
  }
}
