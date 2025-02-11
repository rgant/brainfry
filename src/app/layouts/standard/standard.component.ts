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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FooterComponent,
    HeaderComponent,
    RouterOutlet,
    SidebarComponent,
  ],
  selector: 'app-standard-layout',
  styleUrl: './standard.component.scss',
  templateUrl: './standard.component.html',
})
export class StandardLayoutComponent {}
