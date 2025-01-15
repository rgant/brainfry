import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import type { MetaDefinition } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

export const ROBOTS_META: MetaDefinition = {
  content: 'noindex, nofollow',
  name: 'robots',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ NgOptimizedImage, RouterLink ],
  selector: 'app-page-not-found',
  styleUrl: './page-not-found.component.scss',
  templateUrl: './page-not-found.component.html',
})
export class PageNotFoundComponent implements OnDestroy, OnInit {
  private readonly _metaService: Meta = inject(Meta);
  private _robotsTag: HTMLMetaElement | null = null; // eslint-disable-line unicorn/no-null -- DOM uses null

  public ngOnDestroy(): void {
    if (this._robotsTag) {
      this._metaService.removeTagElement(this._robotsTag);
    }
  }

  public ngOnInit(): void {
    // Prevent robots from indexing this soft 404 page. Note that this probably is only necessary
    // with SSR or JavaScript executing web crawlers.
    this._robotsTag = this._metaService.addTag(ROBOTS_META);
  }
}
