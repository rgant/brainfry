import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Application menu sidebar for logged in vies. Contains links to primary application features, user
 * account features should be linked from the accounts menu in the header.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.component.scss',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {}
