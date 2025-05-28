import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';

/**
 * View for pages where the visitor is not logged in, or where login is not required.
 * Centers all content into the middle of the screen. Dhould be used for single purpose pages.
 */
@Component({
  selector: 'app-central-layout',
  imports: [
    FooterComponent,
    NgOptimizedImage,
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: './central.component.html',
  styleUrl: './central.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CentralLayoutComponent {}
