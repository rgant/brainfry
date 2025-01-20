import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-terms-and-conditions',
  styleUrl: './terms-and-conditions.component.scss',
  templateUrl: './terms-and-conditions.component.html',
})
export class TermsAndConditionsComponent {}
