import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Primary router outlet for the entire application, otherwise a dumb Component.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterOutlet ],
  selector: 'app-root',
  template: '<router-outlet />',
})
export class AppComponent {}
