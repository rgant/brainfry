import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';

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
