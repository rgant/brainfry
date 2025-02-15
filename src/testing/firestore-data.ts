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

import type { PromiseRejecter, PromiseResolver } from './promise-methods';

interface WithResolvers<T> {
  promise: Promise<T>;
  reject: PromiseRejecter;
  resolve: PromiseResolver<T>;
}

export class NoRulesFirestore {
  constructor(
    public readonly collectionName: string,
    public readonly testEnv: RulesTestEnvironment,
  ) {}

  public static async initialize(collectionName: string): Promise<NoRulesFirestore> {
    const testEnv = await initializeTestEnvironment({
      // @firebase/rules-unit-testing assumes it is running in a node.js environment, but Angular
      // is running in a browser with webpack and so `process is not defined` will be thrown here
      // unless _every_ configuration is set so the code doesn't try to load one using environment
      // variables.
      // Also note that in order to add debugging statements to node_modules/@firebase/rules-unit-testing/dist/esm/index.esm.js
      // that will actually be picked up by webpack you need to run `ng cache clean` after every
      // change.
      database: {
        host: '125.0.0.1',
        port: 9000,
      },
      firestore: {
        host: '127.0.0.1',
        port: 8080,
      },
      hub: {
        host: '127.0.0.1',
        port: 4400,
      },
      projectId: 'brainfry-app',
      storage: {
        host: '127.0.0.1',
        port: 9199,
      },
    });

    return new NoRulesFirestore(collectionName, testEnv);
  }

  public async createDocument(payload: DocumentData): Promise<string> {
    return this._withNoRulesContext(async (noRulesContext: RulesTestContext): Promise<string> => {
      const db = noRulesContext.firestore();
      const collectionRef = collection(db, this.collectionName);
      const docRef = await addDoc(collectionRef, payload);
      return docRef.id;
    });
  }

  public async deleteDocument(id: string): Promise<void> {
    return this._withNoRulesContext(async (noRulesContext: RulesTestContext): Promise<void> => {
      const db = noRulesContext.firestore();
      const documentRef = doc(db, this.collectionName, id);
      await deleteDoc(documentRef);
    });
  }

  public async fetchDocument(id: string): Promise<DocumentData | undefined> {
    return this._withNoRulesContext(async (noRulesContext: RulesTestContext): Promise<DocumentData | undefined> => {
      const db = noRulesContext.firestore();
      const documentRef = doc(db, this.collectionName, id);
      const snapshot = await getDoc(documentRef);
      return snapshot.data();
    });
  }

  public async updateDocument(id: string, payload: WithFieldValue<DocumentData>): Promise<void> {
    return this._withNoRulesContext(async (noRulesContext: RulesTestContext): Promise<void> => {
      const db = noRulesContext.firestore();
      const documentRef = doc(db, this.collectionName, id);
      await updateDoc(documentRef, payload);
    });
  }

  private async _withNoRulesContext<T>(implementation: (noRulesContext: RulesTestContext) => Promise<T>): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    // @ts-expect-error needs lib es2024
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
