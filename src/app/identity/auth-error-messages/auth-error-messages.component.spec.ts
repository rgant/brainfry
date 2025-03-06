import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { getCompiled } from '~/testing/utilities';

import { AuthErrorMessagesComponent } from './auth-error-messages.component';

@Component({
  imports: [ AuthErrorMessagesComponent ],
  template: '<app-auth-error-messages [$code]="code" />',
})
class TestComponent {
  public code: string = '';
}

describe('AuthErrorMessagesComponent', (): void => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  // There are a bunch of possible auth error codes, but these are the ones most likely to be seen
  // by users.
  const expectedCodes = {
    /* eslint-disable @typescript-eslint/naming-convention */
    'auth/expired-action-code': 'The action code has expired.',
    'auth/invalid-action-code': 'The action code is invalid.',
    'auth/invalid-continue-uri': 'The continue URL provided in the request is invalid.',
    'auth/invalid-email': 'The email address is badly formatted.',
    'auth/missing-continue-uri': 'A problem occurred.',
    'auth/unauthorized-continue-uri': 'A problem occurred.',
    'auth/user-disabled': 'The user account has been disabled',
    'auth/user-not-found': 'There is no user record corresponding',
    /* eslint-enable @typescript-eslint/naming-convention */
  } as const;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({ imports: [ TestComponent ] }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display messages for expected codes', (): void => {
    const compiled = getCompiled(fixture);

    expect(compiled.textContent).withContext('unknown code').toContain('A problem occurred. Please refresh and try again.');

    for (const [ code, expectedText ] of Object.entries(expectedCodes)) {
      component.code = code;
      fixture.detectChanges();

      expect(compiled.textContent).withContext(code).toContain(expectedText);
    }
  });
});
