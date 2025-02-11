import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import type { MetaDefinition } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

/**
 * Block robots from indexing the 404 page.
 */
export const ROBOTS_META: MetaDefinition = {
  content: 'noindex, nofollow',
  name: 'robots',
} as const;

/**
 * Wildcard catchall route component for paths that do not match configured routes.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ NgOptimizedImage, RouterLink ],
  selector: 'app-page-not-found',
  styleUrl: './page-not-found.component.scss',
  templateUrl: './page-not-found.component.html',
})
export class PageNotFoundComponent implements OnDestroy, OnInit {
  /** Angular service to manage Meta tags. https://angular.dev/api/platform-browser/Meta */
  private readonly _metaService: Meta = inject(Meta);
  /** Reference to the meta tag created OnInit to be removed OnDestroy. */
  private _robotsTag: HTMLMetaElement | null = null; // eslint-disable-line unicorn/no-null -- DOM uses null

  /**
   * Remove the robot blocking meta tag from the HTML Head when this Component is no longer the
   * routed Component.
   */
  public ngOnDestroy(): void {
    if (this._robotsTag) {
      this._metaService.removeTagElement(this._robotsTag);
    }
  }

  /**
   * Prevent robots from indexing this soft 404 page. Note that this probably is only necessary
   * with SSR or JavaScript executing web crawlers.
   */
  public ngOnInit(): void {
    this._robotsTag = this._metaService.addTag(ROBOTS_META);
  }
}
