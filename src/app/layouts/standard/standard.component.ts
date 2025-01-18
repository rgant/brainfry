import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

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
