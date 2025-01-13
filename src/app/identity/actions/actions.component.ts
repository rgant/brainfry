import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-actions',
  styleUrl: './actions.component.scss',
  templateUrl: './actions.component.html',
})
export class ActionsComponent {

}
