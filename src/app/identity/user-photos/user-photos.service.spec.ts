import { TestBed } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { bufferTime, firstValueFrom } from 'rxjs';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { DEFAULT_TEST_USER } from '@testing/constants';
import { provideEmulatedAuth, provideEmulatedStorage } from '@testing/utilities';

import { createAndSignInUser } from '../testing/test-users.spec';
import { createMockTransfer, filename } from './new-photo.spec';
import { UserPhotosService } from './user-photos.service';
import type { Photo, Progress } from './user-photos.service';

describe('UserPhotosService', (): void => {
  let auth: Auth;
  let service: UserPhotosService;

  // When running in --no-watch mode the emulator can be significantly slower. So the delays in this
  // suite are manually adjusted to give likely passing conditions.
  const SLOW_TEST_TIMEOUT = 2000;

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
  }, SLOW_TEST_TIMEOUT);

  it('should upload photo', async (): Promise<void> => {
    // Occasionally this is going to fail when time advances across a second boundry during testing.
    const MICROTIME = -4; // Last 4 characters of ISO 8601 formatted date.
    const UPLOAD_DELAY = 250; // milliseconds

    const expectedDate = jasmine.stringContaining(new Date().toISOString().slice(0, MICROTIME));
    const expectedFilename = jasmine.stringContaining(`-${filename}`);
    const expectedSize = 673_859;

    // Security rules require authentication to access storage files.
    const testUser = await createAndSignInUser(auth);

    const photosPromise: Promise<Photo[][]> = firstValueFrom(service.getProfilePhotos(testUser.uid).pipe(bufferTime(UPLOAD_DELAY)));
    const progressPromise: Promise<Array<Progress | undefined>> = firstValueFrom(service.uploadPercentage$.pipe(bufferTime(UPLOAD_DELAY)));
    const mockTransfer = createMockTransfer();

    service.uploadPhoto(mockTransfer.files, testUser.uid);

    const progress = await progressPromise;
    const [ originalPhotoList, newPhotosList ] = await photosPromise;

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
