import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { FormPopoverComponent } from './form-popover.component';

describe('FormPopoverComponent', (): void => {
  let component: FormPopoverComponent;
  let fixture: ComponentFixture<FormPopoverComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ FormPopoverComponent ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have role', (): void => {
    expect(component.role).toBe('tooltip');

    const compiled: unknown = fixture.nativeElement;
    if (!(compiled instanceof HTMLElement)) {
      throw new TypeError('fixture.nativeElement is not instance of HTMLElement');
    }

    expect(compiled.getAttribute('role')).toBe('tooltip');
  });
});
