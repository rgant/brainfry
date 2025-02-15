import { FieldValue, Timestamp } from '@angular/fire/firestore';
import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SetOptions,
  SnapshotOptions,
  WithFieldValue,
} from '@angular/fire/firestore';

import type { Quiz, QuizPayload } from './quiz.service';

/** Firestore DocumentData compatible model for the database. */
export interface QuizModel extends QuizPayload {
  /** Original creation date, not to be modified. */
  readonly createdAt: Timestamp;
  /** Modification date, updated automatically by the converter. */
  readonly updatedAt: Timestamp;
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
 *
 * Note, using a Class here instead of an object makes the type checker more complicated and there
 * are a lot of complaints about not using `this` from the linter. Which is maybe a rule that I should
 * disable.
 */
export const quizConverter: FirestoreDataConverter<Quiz, QuizModel> = {
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
