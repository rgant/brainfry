import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-photo-manager',
  styleUrl: './photo-manager.component.scss',
  templateUrl: './photo-manager.component.html',
})
export class PhotoManagerComponent {

}
