import { inject, Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  or,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import type { CollectionReference, WithFieldValue } from '@angular/fire/firestore';
import { catchError, of } from 'rxjs';
import type { Observable } from 'rxjs';

import { quizConverter } from './converter';
import type { QuizModel } from './converter';

/** Public interface for Quiz objects outside of this Service. */
export interface Quiz extends QuizPayload {
  /** DocumentReference id for tracking unique objects. */
  readonly id: string;
  /** Original creation date, not to be modified. */
  readonly createdAt: Date;
  /** Modification date, updated automatically by the converter. */
  readonly updatedAt: Date;
}

/** Quiz fields that can be altered by Users. */
export interface QuizPayload {
  /** User ID of Quiz creator. */
  readonly owner: string;
  /** Quizzes that are shared with other users. */
  readonly shared: boolean;
  /** Display title, automatically set for new  Quiz, but can be modified. */
  readonly title: string;
}

// Only exported for testing.
export const COLLECTION_NAME = 'quizzes';

/**
 * Manage Quizes owned by a user. Users can edit Quizzes owned by their ID, and can view Quizzes that
 * they own or are shared.
 *
 * Note: I could have injected `USER$` here to automatically get the correct owner ID, however I've
 * done that in the past in another project and it got complicated to understand, especially for
 * some of the newer developers.
 */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly _firestore: Firestore;
  private readonly _quizCollection: CollectionReference<Quiz, WithFieldValue<QuizModel>>;

  constructor() {
    this._firestore = inject(Firestore);
    this._quizCollection = collection(this._firestore, COLLECTION_NAME).withConverter(quizConverter);
  }

  /**
   * Creates a new quiz with default data including a title based on the current date, and the
   * creation timestamp.
   * @returns the new document id
   */
  public async create(owner: string): Promise<string> {
    const now = new Date();
    const newQuizData: QuizPayload & Pick<Quiz, 'createdAt' | 'updatedAt'> = {
      createdAt: now,
      owner,
      shared: false,
      title: `New Quiz ${now.toDateString()}`,
      updatedAt: now,
    };

    const reference = await addDoc(this._quizCollection, newQuizData);
    return reference.id;
  }

  /** Deletes the quiz by document id */
  public async delete(id: string): Promise<void> {
    const reference = doc(this._quizCollection, id);
    return deleteDoc(reference);
  }

  /** Fetches the quiz by document id */
  public getById(id: string): Observable<Quiz | undefined> {
    const reference = doc(this._quizCollection, id);
    // Not using { idField: 'id' } because the converter already handles that.
    return docData(reference);
  }

  /**
   * List of all Quizzes accessible to the owner.
   * Includes both those owned by the current user id (owner parameter), and those that are shared.
   */
  public list(owner: string): Observable<Quiz[]> {
    const listQuery = query(
      this._quizCollection,
      or(
        where('owner', '==', owner),
        where('shared', '==', true),
      ),
      orderBy('updatedAt', 'desc'),
    );
    // Not using { idField: 'id' } because the converter already handles that.
    return collectionData<Quiz>(listQuery).pipe(
      // If the user has no accessable quizzes, then that appears as a permission-denied error.
      // Instead return an empty array so the Observble emits instead of errors.
      catchError((problem: unknown): Observable<Quiz[]> => {
        if (problem instanceof FirebaseError && problem.code === 'permission-denied') {
          return of([]);
        }

        throw problem;
      }),
    );
  }

  /**
   * Updates the quiz by document id.
   * Only Quizes owned by the owner can be updated.
   */
  public async update(id: string, payload: Partial<QuizPayload>): Promise<void> {
    const reference = doc(this._quizCollection, id);
    // converter.toFirestore is not applied to this payload automatically!
    return updateDoc(reference, { ...payload, updatedAt: Timestamp.now() });
  }
}
