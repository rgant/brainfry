import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Application menu sidebar for logged in vies. Contains links to primary application features, user
 * account features should be linked from the accounts menu in the header.
 */
@Component({
  selector: 'app-sidebar',
  imports: [ RouterLink ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {}
