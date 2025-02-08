import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { PhotoManagerComponent } from './photo-manager.component';

describe('PhotoManagerComponent', (): void => {
  let component: PhotoManagerComponent;
  let fixture: ComponentFixture<PhotoManagerComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ PhotoManagerComponent ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(PhotoManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
