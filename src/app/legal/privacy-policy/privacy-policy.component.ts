import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink ],
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent {}
