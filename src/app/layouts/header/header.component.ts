import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  signal,
} from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/angular-fontawesome';
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ FaIconComponent, NgOptimizedImage, RouterLink ],
  selector: 'app-header',
  styleUrl: './header.component.scss',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  public readonly $showMenu: WritableSignal<boolean> = signal<boolean>(false);
  public readonly faBars: IconDefinition = faBars;
  public readonly faX: IconDefinition = faX;

  /**
   * Close the menu if the user clicks on a link.
   */
  @HostListener('click', [ '$event' ])
  public onClick(event: Event): void {
    const { target } = event;

    if (target instanceof HTMLAnchorElement) {
      this.$showMenu.set(false);
    }
  }

  /**
   * Sets the expanded class on the .menu list, and updates aria-expanded and the icon.
   */
  public toggleMenu(): void {
    const menuShown = this.$showMenu();
    this.$showMenu.set(!menuShown);
  }
}
