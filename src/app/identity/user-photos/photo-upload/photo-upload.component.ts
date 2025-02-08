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

type FileInputRef = ElementRef<HTMLInputElement>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ AsyncPipe, RouterLink ],
  selector: 'app-photo-upload',
  styleUrl: './photo-upload.component.scss',
  templateUrl: './photo-upload.component.html',
})
export class PhotoUploadComponent {
  public readonly $fileCount: InputSignal<number> = input.required();
  public readonly maximumFiles: number = MAXIMUM_PHOTOS;
  public readonly uid: InputSignal<string> = input.required();
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
