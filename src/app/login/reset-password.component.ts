import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-reset-password',
  styleUrl: './reset-password.component.scss',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {

}
