/* eslint-disable import-x/max-dependencies -- config files tend to have a lot of dependencies */
import { isDevMode, provideZoneChangeDetection } from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
// import {
//   getAnalytics,
//   provideAnalytics,
//   ScreenTrackingService,
//   UserTrackingService,
// } from '@angular/fire/analytics';
// import type { Analytics } from '@angular/fire/analytics';
// import { initializeAppCheck, provideAppCheck, ReCaptchaEnterpriseProvider } from '@angular/fire/app-check';
// import type { AppCheck } from '@angular/fire/app-check';
import { getAuth, provideAuth } from '@angular/fire/auth';
import type { Auth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import type { Firestore } from '@angular/fire/firestore';
// import { getFunctions, provideFunctions } from '@angular/fire/functions';
// import type { Functions } from '@angular/fire/functions';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import type { FirebasePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import type { FirebaseStorage } from '@angular/fire/storage';
// import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';
// import type { VertexAI } from '@angular/fire/vertexai';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { AppTitleStrategyService } from './core/app-title-strategy.service';
import { provideOurFirebaseApp } from './core/firebase-app.provider';

/**
 * Setup global dependencies for the application.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideOurFirebaseApp(),
    provideAuth((): Auth => getAuth()),
    // provideAnalytics((): Analytics => getAnalytics()),
    // ScreenTrackingService,
    // UserTrackingService,
    // provideAppCheck((): AppCheck => {
    //   const provider = new ReCaptchaEnterpriseProvider('6LfG3rEqAAAAAK18S9UyMuK8wd3JSWjVnmDzmlrT');
    //   return initializeAppCheck(undefined, { isTokenAutoRefreshEnabled: true, provider });
    // }),
    provideFirestore((): Firestore => getFirestore()),
    // provideFunctions((): Functions => getFunctions()),
    providePerformance((): FirebasePerformance => getPerformance()),
    provideServiceWorker(
      'ngsw-worker.js',
      {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000',
      },
    ),
    provideStorage((): FirebaseStorage => getStorage()),
    // provideVertexAI((): VertexAI => getVertexAI()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategyService },
  ],
};
