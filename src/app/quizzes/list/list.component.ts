import { AsyncPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

import { USER$ } from '@app/core/user.token';
import type { MaybeUser, User } from '@app/core/user.token';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

import { QuizService } from '../quiz.service';
import type { Quiz } from '../quiz.service';

interface ViewModel {
  quizzes: Quiz[];
  user: User;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    DatePipe,
    SpinnerComponent,
    RouterLink,
  ],
  selector: 'app-list',
  styleUrl: './list.component.scss',
  templateUrl: './list.component.html',
})
export class QuizListComponent {
  /** Displays a modal spinner while creating a new Quiz. */
  public readonly $blockWindow: WritableSignal<boolean>;
  /** List of all Quizzes accessible to the user, and the user. */
  public readonly vm$: Observable<ViewModel>;

  private readonly _router: Router;
  private readonly _service: QuizService;

  constructor() {
    this._router = inject(Router);
    this._service = inject(QuizService);

    this.$blockWindow = signal<boolean>(false);

    // Not handling non-logged in users because the Route guards should.
    this.vm$ = inject(USER$).pipe(
      filter((user: MaybeUser): user is User => user != undefined),
      switchMap((user: User): Observable<ViewModel> => this._service.list(user.uid).pipe(
        map((quizzes: Quiz[]): ViewModel => ({ quizzes, user })),
      )),
    );
  }

  public async createNewQuiz(userId: string): Promise<void> {
    this.$blockWindow.set(true);
    const quizId = await this._service.create(userId);
    await this._router.navigate([ 'quizzes', quizId, 'edit' ]);
  }
}
