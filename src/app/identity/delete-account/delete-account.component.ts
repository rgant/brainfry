import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
})
export class DeleteAccountComponent {

}
