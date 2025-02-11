import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';

/**
 * View for pages where the visitor is not logged in, or where login is not required.
 * Centers all content into the middle of the screen. Dhould be used for single purpose pages.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FooterComponent,
    NgOptimizedImage,
    RouterLink,
    RouterOutlet,
  ],
  selector: 'app-central-layout',
  styleUrl: './central.component.scss',
  templateUrl: './central.component.html',
})
export class CentralLayoutComponent {}
