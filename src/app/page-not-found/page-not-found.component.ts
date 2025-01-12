import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-page-not-found',
  styleUrl: './page-not-found.component.scss',
  templateUrl: './page-not-found.component.html',
})
export class PageNotFoundComponent {

}
