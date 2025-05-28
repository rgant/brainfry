import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/**
 * Full screen layout for logged in views. Design is mobile first with header, main content, sidebar,
 * and footer on smaller screens. Larger screens layout with full width header and footer, and middle
 * content containing a sidebar and the main content area.
 */
@Component({
  selector: 'app-standard-layout',
  imports: [
    FooterComponent,
    HeaderComponent,
    RouterOutlet,
    SidebarComponent,
  ],
  templateUrl: './standard.component.html',
  styleUrl: './standard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandardLayoutComponent {}
