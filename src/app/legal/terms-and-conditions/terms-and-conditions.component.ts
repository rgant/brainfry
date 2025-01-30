import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink ],
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
})
export class TermsAndConditionsComponent {}
