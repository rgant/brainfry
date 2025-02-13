import { TestBed } from '@angular/core/testing';
import { FirebaseError } from '@angular/fire/app';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';
import type { CollectionReference, DocumentData } from '@angular/fire/firestore';
import { first, firstValueFrom } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { DEFAULT_TEST_USER, TEST_DATES, UNVERIFIED_TEST_USER } from '@testing/constants';
import { provideEmulatedAuth, provideEmulatedFirestore } from '@testing/utilities';

import { COLLECTION_NAME, QuizService } from './quiz.service';
import type { Quiz } from './quiz.service';
import { DEFAULT_TEST_USER_QUIZZES } from './testing/quizzes.spec';

describe('QuizService', (): void => {
  let auth: Auth;
  let collectionRef: CollectionReference;
  let firestore: Firestore;
  let service: QuizService;

  const createTestQuiz = async (): Promise<string> => {
    const payload: Omit<Quiz, 'id'> = {
      createdAt: TEST_DATES.past,
      owner: DEFAULT_TEST_USER.userId,
      shared: false,
      title: 'Test',
      updatedAt: TEST_DATES.past,
    };
    const reference = await addDoc(collectionRef, payload);
    return reference.id;
  };

  const deleteTestQuiz = async (id: string): Promise<void> => {
    const documentRef = doc(collectionRef, id);
    return deleteDoc(documentRef);
  };

  const getTestQuiz = async (id: string): Promise<DocumentData | undefined> => {
    const documentRef = doc(collectionRef, id);
    const snapshot = await getDoc(documentRef);
    return snapshot.data();
  };

  afterEach(async (): Promise<void> => {
    // Uninstall so other tests aren't impacted by the mock clock.
    jasmine.clock().uninstall();

    // For some reason signing out in this suite causes failures.
    // await signOut(auth);
  });

  beforeEach((): void => {
    jasmine.clock().mockDate(TEST_DATES.now);

    TestBed.configureTestingModule({
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth(), provideEmulatedFirestore() ],
    });
    auth = TestBed.inject(Auth);
    firestore = TestBed.inject(Firestore);
    collectionRef = collection(firestore, COLLECTION_NAME);

    service = TestBed.inject(QuizService);
  });

  beforeEach(async (): Promise<void> => {
    // Security rules require authentication to access firestore.
    await signInWithEmailAndPassword(auth, DEFAULT_TEST_USER.email, DEFAULT_TEST_USER.password);
  });

  it('should create a new Quiz', async (): Promise<void> => {
    const id = await service.create(DEFAULT_TEST_USER.userId);

    expect(id).toBeTruthy();

    const newQuiz = await firstValueFrom(service.getById(id));

    expect(newQuiz).toEqual({
      id,
      createdAt: TEST_DATES.now,
      owner: DEFAULT_TEST_USER.userId,
      shared: false,
      title: 'New Quiz Wed Apr 16 2014',
      updatedAt: TEST_DATES.now,
    });

    // Don't cross pollute other tests
    await deleteTestQuiz(id);
  });

  it('should delete a quiz by id', async (): Promise<void> => {
    const testId = await createTestQuiz();

    await service.delete(testId);

    // Because of the firestore.rules this rejects instead of returning undefined.
    await expectAsync(getTestQuiz(testId)).toBeRejectedWithError(FirebaseError, /evaluation error/u);
  });

  it('should get quiz owned by current user', (done: DoneFn): void => {
    service.getById('SouPDVoZKCT3086dCrej').pipe(first()).subscribe({
      complete: done,
      error: fail,
      next: (quiz: Quiz | undefined): void => {
        expect(quiz).toEqual({
          id: 'SouPDVoZKCT3086dCrej',
          createdAt: new Date('2025-02-12T17:22:55.597Z'),
          owner: DEFAULT_TEST_USER.userId,
          shared: true,
          title: 'Great Quiz',
          updatedAt: new Date('2025-02-12T17:23:02.387Z'),
        });
      },
    });
  });

  it('should get quiz shared with all users', (done: DoneFn): void => {
    service.getById('xc50KpHTzIe0174GW9rm').pipe(first()).subscribe({
      complete: done,
      error: fail,
      next: (quiz: Quiz | undefined): void => {
        expect(quiz).toEqual({
          id: 'xc50KpHTzIe0174GW9rm',
          createdAt: new Date('2025-02-12T17:25:58.752Z'),
          owner: UNVERIFIED_TEST_USER.userId,
          shared: true,
          title: 'Public Quiz',
          updatedAt: new Date('2025-02-12T17:26:03.767Z'),
        });
      },
    });
  });

  it('should error when inaccessible quiz is requested', (done: DoneFn): void => {
    service.getById('UbvRPSpB8Pq5FoxaytQL').subscribe({
      error: (error: unknown): void => {
        if (error instanceof FirebaseError) {
          expect(error.code).toBe('permission-denied');
        } else {
          throw new TypeError('Unknown error');
        }
        done();
      },
      next: fail,
    });
  });

  /**
   * Without the indexes required in production this test might fail. So it was important to run
   * this code in production to see the required indexes (console error message with a link) and
   * then add them the the firestore.indexes.json file so that the emulator would have them.
   */
  it('should list quizzes accessible to user', (done: DoneFn): void => {
    service.list(DEFAULT_TEST_USER.userId)
      .pipe(first())
      .subscribe({
        complete: done,
        error: fail,
        next: (quizzes: Quiz[]): void => {
          expect(quizzes).toEqual(DEFAULT_TEST_USER_QUIZZES);
        },
      });
  });

  /*
   * Because I don't know how to connect to the emulator as the admin without a huge amount of
   * complexity we have to jump through many hoops to setup this test. But it is important because
   * this is the first time quiz manager experience!
   * https://firebase.google.com/docs/emulator-suite/connect_firestore#admin_sdks
   */
  it('should emit an empty list when no accessible quizzes for the user', async (): Promise<void> => {
    const defaultUserShared = doc(collectionRef, 'SouPDVoZKCT3086dCrej');
    const otherUserShared = doc(collectionRef, 'xc50KpHTzIe0174GW9rm');

    await updateDoc(defaultUserShared, { shared: false });

    // Change to the other user
    await signInWithEmailAndPassword(auth, UNVERIFIED_TEST_USER.email, UNVERIFIED_TEST_USER.password);
    await updateDoc(otherUserShared, { shared: false });

    const quizzes = await firstValueFrom(service.list('w2z4c4B9n8QQDBymyHPZFtpaeAw2'));

    expect(quizzes).toEqual([]);

    // Don't cross pollute other tests

    // Re-sign in as default user to restore default user
    await signInWithEmailAndPassword(auth, DEFAULT_TEST_USER.email, DEFAULT_TEST_USER.password);

    await updateDoc(defaultUserShared, { shared: true });
    // Change to the other user
    await signInWithEmailAndPassword(auth, UNVERIFIED_TEST_USER.email, UNVERIFIED_TEST_USER.password);
    await updateDoc(otherUserShared, { shared: true });
  });

  it('should update a quiz by id', async (): Promise<void> => {
    const testId = await createTestQuiz();

    await service.update(testId, { title: 'Modified' });

    await expectAsync(getTestQuiz(testId)).toBeResolvedTo({
      createdAt: TEST_DATES.pastTs,
      owner: DEFAULT_TEST_USER.userId,
      shared: false,
      title: 'Modified',
      updatedAt: TEST_DATES.nowTs,
    });

    // Don't cross pollute other tests
    await deleteTestQuiz(testId);
  });

  it('should require ownership to update', async (): Promise<void> => {
    const testId = await createTestQuiz();
    const updatePromise = service.update(testId, {
      owner: '2c21cf2c-7687-4a42-8649-1502913d5a8c',
      title: 'Modified',
    });

    await expectAsync(updatePromise).toBeRejectedWithError(FirebaseError, /evaluation error/u);

    // Don't cross pollute other tests
    await deleteTestQuiz(testId);
  });
});
