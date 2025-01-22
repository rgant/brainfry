import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { provideEmulatedAuth } from '@testing/helpers';

import { LogoutComponent } from './logout.component';

describe('LogoutComponent', (): void => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ LogoutComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth(), provideRouter([]) ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
