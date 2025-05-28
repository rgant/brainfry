import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type { ElementRef, InputSignal, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Observable } from 'rxjs';

import { MAXIMUM_PHOTOS, UserPhotosService } from '../user-photos.service';
import type { Progress } from '../user-photos.service';

/** Template reference to HTML input type=file */
type FileInputRef = ElementRef<HTMLInputElement>;

/**
 * Handles Firebase User profile photo upload to Firebase Storage.
 */
@Component({
  selector: 'app-photo-upload',
  imports: [ AsyncPipe, RouterLink ],
  templateUrl: './photo-upload.component.html',
  styleUrl: './photo-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoUploadComponent {
  /** Current number of files uploaded, from parent Component. */
  public readonly $fileCount: InputSignal<number> = input.required();
  /** Global maximum number of photos allowed for User. */
  public readonly maximumFiles: number = MAXIMUM_PHOTOS;
  /** Current user ID, from parent Component. */
  public readonly uid: InputSignal<string> = input.required();
  /**
   * Tracks the upload progress. Once complete emits a falsy value to clear progress bar and
   * re-display upload button.
   */
  public readonly uploadPercentage$: Observable<Progress | undefined>;

  private readonly _$fileInput: Signal<FileInputRef> = viewChild.required<FileInputRef>('photoUpload');
  private readonly _userPhotoService: UserPhotosService = inject(UserPhotosService);

  constructor() {
    this.uploadPercentage$ = this._userPhotoService.uploadPercentage$;
  }

  /**
   * Open the browser file picker UI if we think there are fewer than maximum uploads.
   */
  public openFilePicker(): void {
    const fileCount = this.$fileCount();
    const fileInpt = this._$fileInput();

    if (fileCount < this.maximumFiles) {
      fileInpt.nativeElement.click();
    }
  }

  /**
   * Upload the file(s) from the file picker automatically on success
   */
  public uploadFile(): void {
    const fileInpt = this._$fileInput();
    const uid = this.uid();
    const { files } = fileInpt.nativeElement;

    // This is just a type sanity check, it should never happen
    if (!files) {
      throw new Error('photoUpload input is not of type file');
    }

    this._userPhotoService.uploadPhoto(files, uid);
  }
}
