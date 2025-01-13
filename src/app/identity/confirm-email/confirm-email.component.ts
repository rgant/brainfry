import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-confirm-email',
  styleUrl: './confirm-email.component.scss',
  templateUrl: './confirm-email.component.html',
})
export class ConfirmEmailComponent {

}
