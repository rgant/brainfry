import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', (): void => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ HeaderComponent ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
