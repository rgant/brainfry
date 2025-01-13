import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { ActionsComponent } from './actions.component';

describe('ActionsComponent', (): void => {
  let component: ActionsComponent;
  let fixture: ComponentFixture<ActionsComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ ActionsComponent ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
