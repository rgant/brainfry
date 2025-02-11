import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * View accessible to all visitors that establishes rules for user interaction, protects the website
 * owner's legal interests by limiting liability, clarifies ownership of content, and sets
 * expectations for how users can engage with the site, essentially acting as a legal contract
 * outlining the rights and responsibilities of both the website owner and the user.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink ],
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
})
export class TermsAndConditionsComponent {}
