import { inject, Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  FieldValue,
  Firestore,
  or,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import type {
  CollectionReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SetOptions,
  SnapshotOptions,
  WithFieldValue,
} from '@angular/fire/firestore';
import { catchError, of } from 'rxjs';
import type { Observable } from 'rxjs';

/** Public interface for Quiz objects outside of this Service. */
export interface Quiz extends QuizPayload {
  /** DocumentReference id for tracking unique objects. */
  readonly id: string;
  /** Original creation date, not to be modified. */
  readonly createdAt: Date;
  /** Modification date, updated automatically by the converter. */
  readonly updatedAt: Date;
}

/** Firestore DocumentData compatible model for the database. */
interface QuizModel extends QuizPayload {
  /** Original creation date, not to be modified. */
  readonly createdAt: Timestamp;
  /** Modification date, updated automatically by the converter. */
  readonly updatedAt: Timestamp;
}

/** Quiz fields that can be altered by Users. */
interface QuizPayload {
  /** User ID of Quiz creator. */
  readonly owner: string;
  /** Quizzes that are shared with other users. */
  readonly shared: boolean;
  /** Display title, automatically set for new  Quiz, but can be modified. */
  readonly title: string;
}

/**
 * FirestoreDataConverter uses WithFieldValue for toFirestore, which climbs inside of the Date object
 * and messes with all of the type signatures. So this method is over engineered to try and handle
 * that unlikely case that the date is neither a FieldValue nor a Date.
 */
const timestampFromDate = (date: FieldValue | WithFieldValue<Date>): FieldValue | WithFieldValue<Timestamp> => {
  if (date instanceof FieldValue) {
    return date;
  }
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  // This will never be thrown since the `date` value is either a Date or a FieldValue (unless
  // something goes terribly wrong). I opened a ticket about how `WithFieldValue` mangles inner class
  // types: https://github.com/googleapis/nodejs-firestore/issues/2291
  throw new TypeError(`Unknown type ${typeof date}`);
};

/**
 * In order to set the types correctly on the CollectionReference we need to use a FirestoreDataConverter
 * to manipulate the types.
 *
 * At the same time we can perform other actions like converting Timestamps to Dates and adding the
 * document id.
 */
const converter: FirestoreDataConverter<Quiz, QuizModel> = {
  /**
   * Convert the model from the database into the type expected by consumers.
   * Timestamps should all be converted into Dates.
   * Add the Document ID.
   */
  fromFirestore: (snapshot: QueryDocumentSnapshot<QuizModel>, options: SnapshotOptions): Quiz => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  },

  /**
   * This is a much less useful converter as it doesn't apply to updateDoc.
   * It's only purpose is to change the Type, if it wasn't here then things would work better but
   */
  toFirestore: (quiz: WithFieldValue<Quiz>, _options?: SetOptions): WithFieldValue<QuizModel> => {
    const payload: WithFieldValue<QuizModel> = {
      ...quiz,
      createdAt: timestampFromDate(quiz.createdAt),
      updatedAt: timestampFromDate(quiz.updatedAt),
    };
    return payload;
  },
};

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
  private readonly _quizCollection: CollectionReference<Quiz, QuizModel>;

  constructor() {
    this._firestore = inject(Firestore);
    this._quizCollection = collection(this._firestore, COLLECTION_NAME).withConverter(converter);
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
