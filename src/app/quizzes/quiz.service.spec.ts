import { TestBed } from '@angular/core/testing';
import { FirebaseError } from '@angular/fire/app';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { first, firstValueFrom } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { cleanupUsers, createAndSignInUser } from '@app/identity/testing/test-users.spec';
import {
  DEFAULT_TEST_USER,
  SLOW_TEST_TIMEOUT,
  TEST_DATES,
  UNVERIFIED_TEST_USER,
} from '@testing/constants';
import { NoRulesFirestore } from '@testing/firestore-data';
import { provideEmulatedAuth, provideEmulatedFirestore } from '@testing/utilities';

import { COLLECTION_NAME, QuizService } from './quiz.service';
import type { Quiz } from './quiz.service';
import { DEFAULT_TEST_USER_QUIZZES } from './testing/quizzes.spec';

describe('QuizService', (): void => {
  let auth: Auth;
  let service: QuizService;
  let ownerFirestore: NoRulesFirestore;

  const createTestQuiz = async (): Promise<string> => {
    const payload: Omit<Quiz, 'id'> = {
      createdAt: TEST_DATES.past,
      owner: DEFAULT_TEST_USER.userId,
      shared: false,
      title: 'Test',
      updatedAt: TEST_DATES.past,
    };

    return ownerFirestore.createDocument(payload);
  };

  afterAll(async (): Promise<void> => {
    await ownerFirestore.testEnv.cleanup();
  });

  afterEach(async (): Promise<void> => {
    // Uninstall so other tests aren't impacted by the mock clock.
    // It appears that uninstalling the clock after each test can messup the emulator
    jasmine.clock().uninstall();

    // For some reason signing out in this suite causes failures.
    await signOut(auth);
  });

  beforeAll(async (): Promise<void> => {
    ownerFirestore = await NoRulesFirestore.initialize(COLLECTION_NAME);
  });

  beforeEach((): void => {
    jasmine.clock().mockDate(TEST_DATES.now);

    TestBed.configureTestingModule({
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth(), provideEmulatedFirestore() ],
    });

    auth = TestBed.inject(Auth);
    service = TestBed.inject(QuizService);
  });

  beforeEach(async (): Promise<void> => {
    // Security rules require authentication to access firestore.
    await signInWithEmailAndPassword(auth, DEFAULT_TEST_USER.email, DEFAULT_TEST_USER.password);
  });

  it('should create a new Quiz', async (): Promise<void> => {
    const id = await service.create(DEFAULT_TEST_USER.userId);

    expect(id).toBeTruthy();

    const newQuiz = await ownerFirestore.fetchDocument(id);

    expect(newQuiz).toEqual({
      createdAt: TEST_DATES.nowTs,
      owner: DEFAULT_TEST_USER.userId,
      shared: false,
      title: 'New Quiz Wed Apr 16 2014',
      updatedAt: TEST_DATES.nowTs,
    });

    // Don't cross pollute other tests
    await ownerFirestore.deleteDocument(id);
  }, SLOW_TEST_TIMEOUT);

  it('should delete a quiz by id', async (): Promise<void> => {
    const testId = await createTestQuiz();

    await service.delete(testId);

    await expectAsync(ownerFirestore.fetchDocument(testId)).toBeResolvedTo(undefined);
  }, SLOW_TEST_TIMEOUT);

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
  }, SLOW_TEST_TIMEOUT);

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
  }, SLOW_TEST_TIMEOUT);

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
  }, SLOW_TEST_TIMEOUT);

  /**
   * Without the indexes required in production this test might fail. So it was important to run
   * this code in production to see the required indexes (console error message with a link) and
   * then add them the the firestore.indexes.json file so that the emulator would have them.
   */
  it('should list quizzes accessible to user', (done: DoneFn): void => {
    service.list(DEFAULT_TEST_USER.userId)
      // Because of caching (I think) this sometimes emits the wrong number of items.
      // The predicate for first waits until it emits the correct number, or times out.
      .pipe(first((quizzes: Quiz[]): boolean => quizzes.length === DEFAULT_TEST_USER_QUIZZES.length))
      .subscribe({
        complete: done,
        error: fail,
        next: (quizzes: Quiz[]): void => {
          expect(quizzes).toEqual(DEFAULT_TEST_USER_QUIZZES);
        },
      });
  }, SLOW_TEST_TIMEOUT);

  it('should emit an empty list when no accessible quizzes for the user', async (): Promise<void> => {
    await signOut(auth);
    // Unshare the default test quizzes
    await ownerFirestore.updateDocument('SouPDVoZKCT3086dCrej', { shared: false });
    await ownerFirestore.updateDocument('xc50KpHTzIe0174GW9rm', { shared: false });

    const testUser = await createAndSignInUser(auth);
    // Because of caching (I think) this sometimes emits the wrong number of items.
    // The predicate for first waits until it emits the correct number, or times out.
    const list$ = service.list(testUser.uid).pipe(first((data: Quiz[]): boolean => data.length === 0));
    const quizzes = await firstValueFrom(list$);

    expect(quizzes).toEqual([]);

    // Don't cross pollute other tests
    await ownerFirestore.updateDocument('SouPDVoZKCT3086dCrej', { shared: true });
    await ownerFirestore.updateDocument('xc50KpHTzIe0174GW9rm', { shared: true });
    await cleanupUsers(auth, [ testUser ]);
  }, SLOW_TEST_TIMEOUT);

  it('should update a quiz by id', async (): Promise<void> => {
    const testId = await createTestQuiz();

    await service.update(testId, { title: 'Modified' });

    const testQuiz = await ownerFirestore.fetchDocument(testId);

    expect(testQuiz).toEqual({
      createdAt: TEST_DATES.pastTs,
      owner: DEFAULT_TEST_USER.userId,
      shared: false,
      title: 'Modified',
      updatedAt: TEST_DATES.nowTs,
    });

    // Don't cross pollute other tests
    await ownerFirestore.deleteDocument(testId);
  }, SLOW_TEST_TIMEOUT);

  it('should require ownership to update', async (): Promise<void> => {
    const testId = await createTestQuiz();
    const updatePromise = service.update(testId, {
      owner: '2c21cf2c-7687-4a42-8649-1502913d5a8c',
      title: 'Modified',
    });

    await expectAsync(updatePromise).toBeRejectedWithError(FirebaseError, /evaluation error/u);

    // Don't cross pollute other tests
    await ownerFirestore.deleteDocument(testId);
  }, SLOW_TEST_TIMEOUT);
});
