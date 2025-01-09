import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err: unknown): void => { console.error(err); }); // eslint-disable-line promise/prefer-await-to-callbacks
