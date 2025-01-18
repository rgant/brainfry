import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ DatePipe, RouterLink ],
  selector: 'app-footer',
  styleUrl: './footer.component.scss',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  public readonly today: Date = new Date();
}
