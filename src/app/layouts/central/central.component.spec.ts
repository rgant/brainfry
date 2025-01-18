import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CentralLayoutComponent } from './central.component';

describe('CentralLayoutComponent', (): void => {
  let component: CentralLayoutComponent;
  let fixture: ComponentFixture<CentralLayoutComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ CentralLayoutComponent ],
      providers: [ provideRouter([]) ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CentralLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
