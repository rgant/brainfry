import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { RecoverEmailComponent } from './recover-email.component';

describe('RecoverEmailComponent', (): void => {
  let component: RecoverEmailComponent;
  let fixture: ComponentFixture<RecoverEmailComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ RecoverEmailComponent ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecoverEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
