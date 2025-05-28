import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Primary router outlet for the entire application, otherwise a dumb Component.
 */
@Component({
  selector: 'app-root',
  imports: [ RouterOutlet ],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
