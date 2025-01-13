import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-verify-email',
  styleUrl: './verify-email.component.scss',
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent {

}
