import { Component, viewChild } from '@angular/core';
import type { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';

import { getCompiled, safeQuerySelector } from '@testing/utilities';

import { createMockTransfer } from '../new-photo.spec';
import { MAXIMUM_PHOTOS, UserPhotosService } from '../user-photos.service';
import type { Progress } from '../user-photos.service';
import { PhotoUploadComponent } from './photo-upload.component';

@Component({
  imports: [ PhotoUploadComponent ],
  template: '<app-photo-upload [$fileCount]="fileCount" [uid]="uid" />',
})
class TestComponent {
  public readonly component: Signal<PhotoUploadComponent> = viewChild.required(PhotoUploadComponent);
  public fileCount: number = 3; // eslint-disable-line @typescript-eslint/no-magic-numbers -- class property initialization
  public uid: string = '96fb1bb5-07e5-4616-b2c7-d625b8bb0a72';
}

describe('PhotoUploadComponent', (): void => {
  let component: PhotoUploadComponent;
  let fixture: ComponentFixture<TestComponent>;
  let mockService: jasmine.SpyObj<UserPhotosService>;
  let testComponent: TestComponent;

  const mockUploadPercentageSubject$ = new Subject<Partial<Progress> | undefined>();

  beforeEach(async (): Promise<void> => {
    mockService = jasmine.createSpyObj<UserPhotosService>(
      'UserPhotosService',
      [ 'uploadPhoto' ],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- setting up mocks
      { uploadPercentage$: mockUploadPercentageSubject$ as Observable<Progress> },
    );

    await TestBed.configureTestingModule({
      imports: [ TestComponent ],
      providers: [
        provideRouter([]),
        { provide: UserPhotosService, useValue: mockService },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    component = testComponent.component();
    fixture.detectChanges();
  });

  it('should setup required inputs', (): void => {
    expect(component.$fileCount()).withContext('$fileCount').toBe(testComponent.fileCount);
    expect(component.maximumFiles).withContext('maximumFiles').toBe(MAXIMUM_PHOTOS);
    expect(component.uid()).withContext('uid').toBe(testComponent.uid);
  });

  it('should open file picker', (): void => {
    const compiled = getCompiled(fixture);
    const fileInptEl: HTMLInputElement = safeQuerySelector(compiled, 'input');
    const clickSpy = spyOn(fileInptEl, 'click');

    component.openFilePicker();

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should not open file picker when too many files have been uploaded', (): void => {
    const compiled = getCompiled(fixture);
    const fileInptEl: HTMLInputElement = safeQuerySelector(compiled, 'input');
    const clickSpy = spyOn(fileInptEl, 'click');

    testComponent.fileCount = MAXIMUM_PHOTOS;
    fixture.detectChanges();

    component.openFilePicker();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should upload files with service', (): void => {
    const compiled = getCompiled(fixture);
    const fileInptEl: HTMLInputElement = safeQuerySelector(compiled, 'input');
    const mockTransfer = createMockTransfer();

    fileInptEl.files = mockTransfer.files;
    component.uploadFile();

    expect(mockService.uploadPhoto).toHaveBeenCalledOnceWith(mockTransfer.files, testComponent.uid);
  });

  it('should show progress', (): void => {
    const compiled = getCompiled(fixture);

    mockUploadPercentageSubject$.next({ progress: 0 });
    fixture.detectChanges();

    const progressEl: HTMLProgressElement = safeQuerySelector(compiled, 'progress');

    expect(progressEl.value).withContext('value').toBe(0);
    expect(progressEl.textContent).toBe('0%');

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- counting to 96 by 19
    for (let i = 1; i <= 100; i += 19) {
      mockUploadPercentageSubject$.next({ progress: i });
      fixture.detectChanges();

      expect(progressEl.value).withContext('value').toBe(i);
      expect(progressEl.textContent).toBe(`${i}%`);
    }

    // Hide progress
    mockUploadPercentageSubject$.next(undefined);
    fixture.detectChanges();

    expect(compiled.querySelector('progress')).withContext('progress').toBeNull();
    expect(compiled.querySelector('.info-button')).withContext('.info-button').toBeTruthy();
  });

  it('should open picker on click', (): void => {
    const compiled = getCompiled(fixture);
    const buttonEl: HTMLButtonElement = safeQuerySelector(compiled, '.info-button');
    const openSpy = spyOn(component, 'openFilePicker');

    buttonEl.click();

    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('should show manage upload link when at maximum files', (): void => {
    testComponent.fileCount = MAXIMUM_PHOTOS;
    fixture.detectChanges();

    const compiled = getCompiled(fixture);

    expect(compiled.querySelector('progress')).withContext('progress').toBeNull();
    expect(compiled.querySelector('a')).withContext('a').toBeTruthy();
    expect(compiled.querySelector('.info-button')).withContext('.info-button').toBeNull();
  });
});
