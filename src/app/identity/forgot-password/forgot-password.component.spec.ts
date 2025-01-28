import { fakeAsync, TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideOurFirebaseApp } from '@app/core/firebase-app.provider';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '@testing/utilities';

import { ariaInvalidTest } from '../testing/aria-invalid.spec';
import { emailControlTest, emailErrorMessagesTest, emailInputTest } from '../testing/email-field.spec';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', (): void => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ ForgotPasswordComponent ],
      providers: [ provideOurFirebaseApp(), provideEmulatedAuth(), provideRouter([]) ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should error when invalid form is submitted', async (): Promise<void> => {
    await expectAsync(component.onSubmit()).toBeRejectedWithError('Invalid form submitted');
  });

  it('should configure email FormControl', (): void => {
    emailControlTest(component.emailCntrl);
  });

  it('should configure email input', (): void => {
    emailInputTest(fixture, 'fld-email');
  });

  it('should set email input aria-invalid attribute', (): void => {
    ariaInvalidTest(component.emailCntrl, fixture, 'fld-email');
  });

  it('should configure email error messages', fakeAsync((): void => {
    emailErrorMessagesTest(component.emailCntrl, fixture, 'fld-email-msgs');
  }));

  it('should configure reset password FormGroup', (): void => {
    // Default state
    // eslint-disable-next-line unicorn/no-null -- DOM forms use null
    expect(component.forgotForm.value).withContext('value').toEqual({ email: null });
    expect(component.forgotForm.invalid).withContext('invalid').toBeTrue();

    // Valid
    component.forgotForm.setValue({ email: 'c817@49ad.ac20' });

    expect(component.forgotForm.valid).withContext('valid').toBeTrue();
  });

  it('should configure submit button', (): void => {
    const submitSpy = spyOn(component, 'onSubmit');
    const compiled: HTMLElement = getCompiled(fixture);
    const bttnEl: HTMLButtonElement = safeQuerySelector(compiled, 'button');

    expect(bttnEl.disabled).withContext('disabled').toBeTrue();

    component.emailCntrl.setValue('6783@4086.890b');
    fixture.detectChanges();

    expect(component.emailCntrl.invalid).toBeFalse();
    expect(bttnEl.disabled).withContext('disabled').toBeFalse();

    bttnEl.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
