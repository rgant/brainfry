import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-photo-manager',
  imports: [],
  templateUrl: './photo-manager.component.html',
  styleUrl: './photo-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoManagerComponent {}
