import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ NgOptimizedImage, RouterLink ],
  selector: 'app-page-not-found',
  styleUrl: './page-not-found.component.scss',
  templateUrl: './page-not-found.component.html',
})
export class PageNotFoundComponent {}
