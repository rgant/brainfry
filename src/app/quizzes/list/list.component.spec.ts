import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom, Subject } from 'rxjs';

import { provideOurFirebaseApp } from '~/app/core/firebase-app.provider';
import { USER$ } from '~/app/core/user.token';
import { DEFAULT_TEST_USER } from '~/testing/constants';
import { getCompiled, provideEmulatedAuth, safeQuerySelector } from '~/testing/utilities';

import { QuizService } from '../quiz.service';
import type { Quiz } from '../quiz.service';
import { DEFAULT_TEST_USER_QUIZZES } from '../testing/quizzes.spec';
import { QuizListComponent } from './list.component';

describe('QuizListComponent', (): void => {
  let auth: Auth;
  let component: QuizListComponent;
  let fixture: ComponentFixture<QuizListComponent>;
  let mockService: jasmine.SpyObj<QuizService>;

  const listSubject$ = new Subject<Quiz[]>();

  afterEach(async (): Promise<void> => {
    // Prevent cross test pollution because it seems users can remain logged in across tests.
    await signOut(auth);
  });

  beforeEach(async (): Promise<void> => {
    mockService = jasmine.createSpyObj<QuizService>('QuizService', [ 'create', 'list' ]);
    mockService.list.and.returnValue(listSubject$);

    await TestBed.configureTestingModule({
      imports: [ QuizListComponent ],
      providers: [
        provideOurFirebaseApp(),
        provideEmulatedAuth(),
        provideRouter([]),
        { provide: QuizService, useValue: mockService },
      ],
    })
      .compileComponents();

    auth = TestBed.inject(Auth);

    fixture = TestBed.createComponent(QuizListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(async (): Promise<void> => {
    const user$ = TestBed.inject(USER$);

    await signInWithEmailAndPassword(auth, DEFAULT_TEST_USER.email, DEFAULT_TEST_USER.password);
    // await fixture.whenStable();
    // Emitting the user takes a bit of time and `fixture.whenStable()` doesn't work.
    await firstValueFrom(user$);
    fixture.detectChanges();
  });

  it('should create a new quiz', async (): Promise<void> => {
    const expectedQuizId = '87de7543-254d-49c2-9124-88d9e7e49e3b';
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const createSpy = mockService.create.and.resolveTo(expectedQuizId);

    expect(component.$blockWindow()).withContext('$blockWindow').toBeFalse();

    await component.createNewQuiz(DEFAULT_TEST_USER.userId);

    expect(component.$blockWindow()).withContext('$blockWindow').toBeTrue();
    expect(createSpy).withContext('create').toHaveBeenCalledOnceWith(DEFAULT_TEST_USER.userId);
    expect(navigateSpy).withContext('navigate').toHaveBeenCalledOnceWith([ 'quizzes', expectedQuizId, 'edit' ]);
  });

  it('should show spinner', (): void => {
    const compiled = getCompiled(fixture);

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeTruthy();
    expect(compiled.querySelector('h2')).withContext('h2').toBeNull();

    listSubject$.next(DEFAULT_TEST_USER_QUIZZES);
    fixture.detectChanges();

    expect(compiled.querySelector('app-spinner')).withContext('app-spinner').toBeNull();
    expect(compiled.querySelector('h2')).withContext('h2').toBeTruthy();
  });

  it('should call createNewQuiz on click', (): void => {
    listSubject$.next(DEFAULT_TEST_USER_QUIZZES);
    fixture.detectChanges();

    const compiled = getCompiled(fixture);
    const buttonEl: HTMLButtonElement = safeQuerySelector(compiled, '.button');
    const createSpy = spyOn(component, 'createNewQuiz');

    buttonEl.click();
    fixture.detectChanges();

    expect(createSpy).toHaveBeenCalledOnceWith(DEFAULT_TEST_USER.userId);
  });

  it('should list available quizzes', (): void => {
    listSubject$.next(DEFAULT_TEST_USER_QUIZZES);
    fixture.detectChanges();

    const compiled = getCompiled(fixture);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      month: 'numeric',
      year: '2-digit',
    };
    const dateFormatter = Intl.DateTimeFormat('en-US', options);
    const listItems: NodeListOf<HTMLLIElement> = compiled.querySelectorAll('li');

    expect(listItems).withContext('li elements').toHaveSize(DEFAULT_TEST_USER_QUIZZES.length);

    for (const [ indx, expectedQuiz ] of DEFAULT_TEST_USER_QUIZZES.entries()) {
      const itemEl = listItems[indx];
      if (itemEl) {
        const lnkEl: HTMLAnchorElement = safeQuerySelector(itemEl, 'a');

        expect(itemEl.textContent).toContain(expectedQuiz.title);
        expect(itemEl.textContent).toContain(`(Updated ${dateFormatter.format(expectedQuiz.updatedAt)})`);

        if (expectedQuiz.owner === DEFAULT_TEST_USER.userId) {
          const re = new RegExp(`/${expectedQuiz.id}/edit`, 'u');

          expect(lnkEl.href).toMatch(re);
          expect(lnkEl.textContent).toContain('Edit');
        } else {
          const re = new RegExp(`/${expectedQuiz.id}/present`, 'u');

          expect(lnkEl.href).toMatch(re);
          expect(itemEl.textContent).toContain('(shared with you)');
          expect(lnkEl.textContent).toContain('View');
        }
      } else {
        fail(`Could not find li element for index ${indx}`);
      }
    }
  });
});
