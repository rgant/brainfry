import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { PrivacyPolicyComponent } from './privacy-policy.component';

describe('PrivacyPolicyComponent', (): void => {
  let component: PrivacyPolicyComponent;
  let fixture: ComponentFixture<PrivacyPolicyComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ PrivacyPolicyComponent ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
