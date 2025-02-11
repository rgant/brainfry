import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Global footer for both logged in and out views used by Standard & Central layout components.
 * Links to the legal pages for the application and displays the copyright notice.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ DatePipe, RouterLink ],
  selector: 'app-footer',
  styleUrl: './footer.component.scss',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  /**
   * Used to display the current year for copyright.
   *
   * Note that if the view remains open across a year change then this will not be updated. However,
   * that isn't a real concern.
   */
  public readonly today: Date = new Date();
}
