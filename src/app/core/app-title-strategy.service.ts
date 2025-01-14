import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy } from '@angular/router';
import type { RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategyService extends TitleStrategy {
  private readonly _baseTitle: string; // Title tag content from index.html
  private readonly _title: Title;

  constructor() {
    super();
    this._title = inject(Title);
    // Tested in `ng serve` and `ng build` that this gets the <title> from index.html
    this._baseTitle = this._title.getTitle();
  }

  public updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    if (pageTitle == undefined) {
      this._title.setTitle(this._baseTitle);
    } else {
      this._title.setTitle(`${pageTitle} | ${this._baseTitle}`);
    }
  }
}
