import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-logout',
  templateUrl: './logout.component.html',
})
export class LogoutComponent {

}
