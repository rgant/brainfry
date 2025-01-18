import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ NgOptimizedImage ],
  selector: 'app-header',
  styleUrl: './header.component.scss',
  templateUrl: './header.component.html',
})
export class HeaderComponent {

}
