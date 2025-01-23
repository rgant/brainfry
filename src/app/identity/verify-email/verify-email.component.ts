/**
 * Marks the user's email as verified.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent {

}
