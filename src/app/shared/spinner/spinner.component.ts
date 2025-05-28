import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Use while waiting for asynchronous tasks to complete.
 *
 * Source: https://github.com/n3r4zzurr0/svg-spinners/blob/main/svg-css/blocks-shuffle-3.svg
 */
@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.svg',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {}
