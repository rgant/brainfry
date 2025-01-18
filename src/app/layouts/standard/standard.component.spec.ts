import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { StandardLayoutComponent } from './standard.component';

describe('StandardLayoutComponent', (): void => {
  let component: StandardLayoutComponent;
  let fixture: ComponentFixture<StandardLayoutComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ StandardLayoutComponent ],
      providers: [ provideRouter([]) ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(StandardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
