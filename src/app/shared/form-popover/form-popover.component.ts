import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-form-popover',
  styleUrl: './form-popover.component.scss',
  template: '<ng-content />',
})
export class FormPopoverComponent {
  @HostBinding('role') public readonly role: string = 'tooltip';
}
