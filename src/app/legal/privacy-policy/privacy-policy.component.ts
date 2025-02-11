import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * View accessible to all visitors that informs users how their personal data is collected, stored,
 * used, and shared, thereby building trust with visitors and complying with data privacy laws by
 * transparently disclosing their practices regarding user information, which is often required by
 * law in many jurisdictions; essentially, it's a way to let users know what information is being
 * gathered and how it will be used, allowing them to make informed decisions about their online
 * activity.
 *
 * Based off this [online tool's](https://app.termsfeed.com/download/9bce549e-b5ec-4e05-acd7-8fa53c7fa497) output.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink ],
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent {}
