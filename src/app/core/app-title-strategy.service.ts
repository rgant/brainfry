import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy } from '@angular/router';
import type { RouterStateSnapshot } from '@angular/router';

/**
 * Sets the current HTML page title using the title value from the route.
 */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategyService extends TitleStrategy {
  /** Title tag content from index.html */
  private readonly _baseTitle: string;
  private readonly _title: Title;

  constructor() {
    super();
    this._title = inject(Title);
    // Tested in `ng serve` and `ng build` that this gets the <title> from index.html
    this._baseTitle = this._title.getTitle();
  }

  /**
   * Sets the current title for the page from the route, suffixing with the value in the title
   * element in index.html.
   */
  public updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    if (pageTitle == undefined) {
      this._title.setTitle(this._baseTitle);
    } else {
      this._title.setTitle(`${pageTitle} | ${this._baseTitle}`);
    }
  }
}
