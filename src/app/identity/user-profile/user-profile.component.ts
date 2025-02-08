/**
 * This is an example of how front-end design can be made complicated by back-end design. Since the
 * Firebase User profile only supports a single `photoURL` field, this component jumps through a few
 * hoops to handle a variety of ways of the user specifying thier photo. Probably ripe for a better
 * design later.
 */
/* eslint-disable import-x/max-dependencies -- 11 dependencies */
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { updateProfile } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import type { ValidationErrors } from '@angular/forms';
import {
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs';
import type { Observable } from 'rxjs';

import { USER$ } from '@app/core/user.token';
import type { MaybeUser } from '@app/core/user.token';
import { controlErrorsSignal } from '@app/shared/control-errors-signal.util';
import { controlInvalidSignal } from '@app/shared/control-invalid-signal.util';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { AuthErrorMessagesComponent } from '../auth-error-messages/auth-error-messages.component';
import { getErrorCode } from '../error-code';
import { PhotoUploadComponent } from '../user-photos/photo-upload/photo-upload.component';
import { UserPhotosService } from '../user-photos/user-photos.service';
import type { Photo } from '../user-photos/user-photos.service';

type ProfileFormGroup = FormGroup<{
  displayName: FormControl<string | null>;
  photoURL: FormControl<string | null>;
}>;

interface ViewModel {
  profilePhotos: Photo[];
  user: User;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AuthErrorMessagesComponent,
    NgOptimizedImage,
    PhotoUploadComponent,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  selector: 'app-user-profile',
  styleUrl: './user-profile.component.scss',
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent {
  public readonly $errorCode: WritableSignal<string>;
  public readonly $nameCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $nameCntrlInvalid: Signal<boolean>;
  public readonly $photoUrlCntrlErrors: Signal<ValidationErrors | undefined>;
  public readonly $photoUrlCntrlInvalid: Signal<boolean>;
  public readonly $showForm: WritableSignal<boolean>;
  public readonly $showUrlInput: WritableSignal<boolean>;
  public readonly nameCntrl: FormControl<string | null>;
  public readonly photoUrlCntrl: FormControl<string | null>;
  public readonly profileForm: ProfileFormGroup;
  public readonly vm$: Observable<ViewModel>;

  private readonly _userPhotoService: UserPhotosService;

  constructor() {
    this._userPhotoService = inject(UserPhotosService);

    this.nameCntrl = new FormControl<string | null>(null, Validators.required); // eslint-disable-line unicorn/no-null -- Forms use null
    this.$nameCntrlErrors = controlErrorsSignal(this.nameCntrl);
    this.$nameCntrlInvalid = controlInvalidSignal(this.nameCntrl);

    // eslint-disable-next-line unicorn/no-null -- Forms use null
    this.photoUrlCntrl = new FormControl<string | null>(null, Validators.pattern(/\.(?:avif|gif|jpe?g|png|webp)(?:\?.*)?$/u));
    this.$photoUrlCntrlErrors = controlErrorsSignal(this.photoUrlCntrl);
    this.$photoUrlCntrlInvalid = controlInvalidSignal(this.photoUrlCntrl);

    this.profileForm = new FormGroup({
      displayName: this.nameCntrl,
      photoURL: this.photoUrlCntrl,
    });

    this.$errorCode = signal<string>('');
    this.$showForm = signal<boolean>(false);
    this.$showUrlInput = signal<boolean>(true);

    // Not handling non-logged in users because the Route guards should.
    this.vm$ = inject(USER$).pipe(
      filter((user: MaybeUser): user is User => user != undefined),
      tap({
        next: (user: User): void => {
          this.profileForm.patchValue(user);
          this.$showForm.set(true);
        },
      }),
      switchMap((user: User): Observable<ViewModel> => {
        const { photoURL, uid } = user;

        return this._userPhotoService.getProfilePhotos(uid).pipe(
          map((profilePhotos: Photo[]): ViewModel => {
            for (const photo of profilePhotos) {
              if (photo.url === photoURL) {
                // Show the upload photo UI instead since that is what was used.
                this.$showUrlInput.set(false);
                break;
              }
            }

            return { profilePhotos, user };
          }),
        );
      }),
    );
  }

  /**
   * Update the Firebase User profile data.
   */
  public async onSubmit(user: User): Promise<void> {
    const { displayName, photoURL } = this.profileForm.value;

    // Validators prevent email1 or password being falsey, but TypeScript doesn't know that.
    if (this.profileForm.invalid || !displayName) {
      throw new Error('Invalid form submitted');
    }

    this.$showForm.set(false);
    this.$errorCode.set(''); // Clear out any existing errors

    try {
      // It appears that the types for photoURL are incorrect and you must use an empty string
      // instead of null to clear the value. https://stackoverflow.com/questions/71047275/setting-a-firebase-user-photourl-value-to-null
      // auth/invalid-json-payload-received.-/photourl-must-be-string
      const safePhotoURL = photoURL ?? '';
      await updateProfile(user, { displayName, photoURL: safePhotoURL });
    } catch (err: unknown) {
      const code = getErrorCode(err);
      this.$errorCode.set(code);
    }

    this.$showForm.set(true);
  }

  /**
   * Toggle the UI to set the photoURL manually to a remote URL or to picking from a list of uploaded
   * profile photos in Firebase Storage.
   */
  public togglePhotoUrl(): void {
    this.$showUrlInput.update((showUrl: boolean): boolean => !showUrl);
  }
}
