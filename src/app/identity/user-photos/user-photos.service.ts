import { inject, Injectable } from '@angular/core';
import {
  getDownloadURL,
  getMetadata,
  listAll,
  percentage,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import type {
  FullMetadata,
  ListResult,
  UploadTask,
  UploadTaskSnapshot,
} from '@angular/fire/storage';
import {
  BehaviorSubject,
  endWith,
  finalize,
  Subject,
  switchMap,
} from 'rxjs';
import type { Observable } from 'rxjs';

/**
 * Firebase storage file
 */
export interface Photo {
  /** Need the file metadata to sort by time. */
  metadata: FullMetadata;
  /** Special download URL for file based on storage.rules. */
  url: string;
}

/**
 * Upload progress to Firebase Storage
 */
export interface Progress {
  /** Upload precentage between 0% and 100% */
  progress: number;
  /** Not used, but part of the rxfire interface */
  snapshot: UploadTaskSnapshot;
}

/** Total allowed uploaded profile photos. */
export const MAXIMUM_PHOTOS = 6;
/** Directory below UID directory for files. */
const PHOTO_DIR = 'profile-photos';
/** Represent random number using letters and numbers. */
const RADIX = 36;
/** Remove the whole number and decimal point from Math.random */
const SKIP_WHOLE_NUM = 2;

/**
 * Specific handling for Firebase storage of user profile photos.
 */
@Injectable({ providedIn: 'root' })
export class UserPhotosService {
  /**
   * Track the percentage uploaded of `uploadPhoto`.
   * Idea here is that while falsy (before first emit, when emitting undefined) then the template
   * will show an `@else` branch for file picker UI. But while uploading it will emit progress for
   * use in a progress meter.
   * To automatically refresh the uploaded profile photos from `getProfilePhotos` this must be
   * subscribed to.
   */
  public readonly uploadPercentage$: Observable<Progress | undefined>;

  /** Emits whenever a new profile photo is uploaded to re-fetch the list of all photos for the User. */
  private readonly _refreshFilesSubject$: BehaviorSubject<void>;
  private readonly _storage: Storage = inject(Storage);
  /** Triggers `uploadPercentage$` to track a new upload task. */
  private readonly _taskSubject$: Subject<UploadTask>;

  constructor() {
    this._refreshFilesSubject$ = new BehaviorSubject<void>(undefined);
    this._taskSubject$ = new Subject<UploadTask>();

    this.uploadPercentage$ = this._taskSubject$.pipe(
      switchMap((task: UploadTask): Observable<Progress | undefined> =>
        // First emit the upload progress as a percentage.
        // https://github.com/FirebaseExtended/rxfire/blob/b91f358e2c13c6bf33fb4a540e3963c3902a62b1/storage/index.ts#L115
        percentage(task).pipe(
          // Then when complete (100% progress), emit undefined to reset the Observable to falsy.
          endWith(undefined),
          // Inform `getProfilePhotos` that there are new files to fetch since storage doesn't stream StorageReferences.
          finalize((): void => { this._refreshFilesSubject$.next(); }),
        )),
    );
  }

  /**
   * Gets a list of profile photos from Firebase Storage for the UID. Sorted by most recently uploaded.
   * So long as something is subscribed to `uploadPercentage$` then this will be refreshed on each upload.
   */
  public getProfilePhotos(uid: string): Observable<Photo[]> {
    const profilePhotosRef = ref(this._storage, `${uid}/${PHOTO_DIR}`);

    return this._refreshFilesSubject$.pipe(
      // Using an inner Observable here to allow us to refresh the files list after each upload.
      // But this will only work if someone is subscribed to `uploadPercentage$`!
      switchMap(async (): Promise<Photo[]> => {
        const profilePhotos: Photo[] = [];
        const profilePhotosList: ListResult = await listAll(profilePhotosRef);
        const promises: Array<Promise<[PromiseSettledResult<string>, PromiseSettledResult<FullMetadata>]>> = [];

        // Need the metadata for sorting and the download URL for displaying & form values.
        // Note this does not handle nested folders, but we aren't using those.
        for (const item of profilePhotosList.items) {
          const promise = Promise.allSettled([ getDownloadURL(item), getMetadata(item) ]);
          promises.push(promise);
        }

        // Build the data structure for the Photos.
        for (const result of await Promise.all(promises)) {
          const [ settledUrl, settledMetadata ] = result;
          if (settledUrl.status === 'rejected') {
            console.error(settledUrl.reason);
          } else if (settledMetadata.status === 'rejected') {
            console.error(settledMetadata.reason);
          } else {
            profilePhotos.push({
              metadata: settledMetadata.value,
              url: settledUrl.value,
            });
          }
        }

        // Organize the photos by most recently uploaded.
        profilePhotos.sort((a: Photo, b: Photo): number => Number(new Date(b.metadata.updated)) - Number(new Date(a.metadata.updated)));

        return profilePhotos;
      }),
    );
  }

  /**
   * Uploads files to the user's profile photos directory. `uploadPercentage$` will track progress.
   *
   * Note that `files` is expected to be a list of one File. However the code is nominally designed
   * to handle multiple uploads. In that case the `uploadPercentage$` will only be for the final file
   * uploaded, which if the previous files are still going might be wrong. Unclear how to handle that
   * case at this time.
   */
  public uploadPhoto(files: FileList, uid: string): void {
    for (const file of files) {
      // Unlike AWS S3, Firebase storage knows what folders are, and requires you to traverse into them.
      // So for more straightforward access prefix the filename with a random value to avoid collisions
      // instead of using a folder.
      const prefix = Math.random().toString(RADIX).slice(SKIP_WHOLE_NUM);
      const path = `${uid}/${PHOTO_DIR}/${prefix}-${file.name}`;
      const storageRef = ref(this._storage, path);
      const task = uploadBytesResumable(storageRef, file);
      this._taskSubject$.next(task);
    }
  }
}
