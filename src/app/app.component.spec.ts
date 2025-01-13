import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { AppComponent } from './app.component';

describe('AppComponent', (): void => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ AppComponent ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', (): void => {
    expect(component).toBeTruthy();
  });
});
