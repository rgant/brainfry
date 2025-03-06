import { TestBed } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { bufferTime, firstValueFrom } from 'rxjs';

import { provideOurFirebaseApp } from '~/app/core/firebase-app.provider';
import { DEFAULT_TEST_USER, SLOW_TEST_TIMEOUT } from '~/testing/constants';
import { provideEmulatedAuth, provideEmulatedStorage } from '~/testing/utilities';

import { createAndSignInUser } from '../testing/test-users.spec';
import { createMockTransfer, filename } from './new-photo.spec';
import { UserPhotosService } from './user-photos.service';
import type { Photo, Progress } from './user-photos.service';

/**
 * Since we cannot control the Firebase Storage Emulator's clock, use this custom AsymmetricMatcher
 * to ensure that dates are within the range.
 *
 * @param beforeTs - should be `Date.now()` called _before_ the promise is created.
 * @param afterTs - should be `Date.now()` called _after_ the promise resolves.
 */
const betweenTimes = (beforeTs: number, afterTs: number): jasmine.AsymmetricMatcher<string> => ({
  /**
   * Ensures the test date is between before and after.
   * @param testDateStr - ISO formatted date string from the Firebase Storage Metadata.
   */
  asymmetricMatch: (testDateStr: string): boolean => {
    const testTs = new Date(testDateStr).getTime();
    return beforeTs <= testTs && testTs <= afterTs;
  },

  /**
   * Used for the error message.
   * Example:
   * ```
   * Expected $[0].metadata.timeCreated = '2025-02-14T20:18:08.111Z' to equal
   *   <betweenTimes 2025-02-14T20:18:08.222Z and 2025-02-14T20:18:08.333Z>.
   * ```
   */
  jasmineToString: (): string => `<betweenTimes ${new Date(beforeTs).toISOString()} and ${new Date(afterTs).toISOString()}>`,
});

describe('UserPhotosService', (): void => {
  let auth: Auth;
  let service: UserPhotosService;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth(), provideEmulatedStorage() ],
    });
    auth = TestBed.inject(Auth);

    service = TestBed.inject(UserPhotosService);
  });

  it('should get photos', async (): Promise<void> => {
    const expectedPhotoCount = 5;

    // Security rules require authentication to access storage files.
    await signInWithEmailAndPassword(auth, DEFAULT_TEST_USER.email, DEFAULT_TEST_USER.password);

    const photos: Photo[] = await firstValueFrom(service.getProfilePhotos(DEFAULT_TEST_USER.userId));

    expect(photos).withContext(`photos.length ${photos.length}`).toHaveSize(expectedPhotoCount);

    // Confirm photos are ordered from most recent to least.
    let updatedAt = Date.now();
    for (const photo of photos) {
      const photoUpdatedAt = new Date(photo.metadata.updated);

      expect(photoUpdatedAt).withContext(`${photo.metadata.name} ${photo.metadata.updated}`).toBeLessThan(updatedAt);

      updatedAt = Number(photoUpdatedAt);
    }

    // Prevent cross test pollution because it seems users can remain logged in across tests.
    await signOut(auth);
  }, SLOW_TEST_TIMEOUT);

  it('should upload photo', async (): Promise<void> => {
    const UPLOAD_DELAY = 300; // milliseconds

    const expectedFilename = jasmine.stringContaining(`-${filename}`);
    const expectedSize = 673_859;

    // Security rules require authentication to access storage files.
    const testUser = await createAndSignInUser(auth);

    const photosPromise: Promise<Photo[][]> = firstValueFrom(service.getProfilePhotos(testUser.uid).pipe(bufferTime(UPLOAD_DELAY)));
    const progressPromise: Promise<Array<Progress | undefined>> = firstValueFrom(service.uploadPercentage$.pipe(bufferTime(UPLOAD_DELAY)));
    const mockTransfer = createMockTransfer();
    const beforeTs = Date.now();

    service.uploadPhoto(mockTransfer.files, testUser.uid);

    const progress = await progressPromise;
    const [ originalPhotoList, newPhotosList ] = await photosPromise;
    const afterTs = Date.now();
    const expectedDate = betweenTimes(beforeTs, afterTs);

    // List of photos should be refreshed on upload
    expect(originalPhotoList).withContext('original photo list').toEqual([]);
    expect(newPhotosList).withContext('new photo list').toEqual([
      {
        metadata: jasmine.objectContaining({
          contentType: 'image/jpeg',
          md5Hash: 'VbcklCVRL9xc5u3tkVhOlg==',
          name: expectedFilename,
          size: expectedSize,
          timeCreated: expectedDate,
          updated: expectedDate,
        }),
        url: expectedFilename,
      },
    ]);

    // Upload progress
    const ninimumProgressEvents = 3;
    const finalProgress = -1;
    const completeProgress = -2;

    expect(progress.length).toBeGreaterThan(ninimumProgressEvents);

    expect(progress.at(completeProgress)).withContext('Complete Progress').toEqual({
      progress: 100,
      snapshot: jasmine.objectContaining({
        bytesTransferred: expectedSize,
        state: 'success',
        totalBytes: expectedSize,
      }),
    });

    expect(progress.at(finalProgress)).toBeUndefined();
  }, SLOW_TEST_TIMEOUT);
});
