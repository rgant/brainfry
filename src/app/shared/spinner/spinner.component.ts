import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Use while waiting for asynchronous tasks to complete.
 *
 * Source: https://github.com/n3r4zzurr0/svg-spinners/blob/main/svg-css/blocks-shuffle-3.svg
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-spinner',
  styleUrl: './spinner.component.scss',
  templateUrl: './spinner.component.svg',
})
export class SpinnerComponent {}
