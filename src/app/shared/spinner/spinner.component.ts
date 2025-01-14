/**
 * Source: https://github.com/n3r4zzurr0/svg-spinners/blob/main/svg-css/blocks-shuffle-3.svg
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-spinner',
  styleUrl: './spinner.component.scss',
  templateUrl: './spinner.component.svg',
})
export class SpinnerComponent {}
