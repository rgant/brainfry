import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [ RouterOutlet ],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class AppComponent {
  public readonly title: string = 'brainfry';
}
