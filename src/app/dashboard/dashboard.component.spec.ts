import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { provideOurFirebaseApp } from '~/app/core/firebase-app.provider';
import { provideEmulatedAuth } from '~/testing/utilities';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', (): void => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ DashboardComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth() ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
