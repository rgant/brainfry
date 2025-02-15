import type { EnvironmentProviders } from '@angular/core';
import { LogLevel, setLogLevel } from '@angular/fire';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import type { FirebaseApp } from '@angular/fire/app';

/**
 * As best I can tell this is not as useful as jamesdaniels thinks it will be since it triggers on
 * _every_ request done outside of a constructor. I really don't think that is valid as most of these
 * operations don't need injection context IMO.
 * https://github.com/angular/angularfire/blob/main/docs/zones.md#logging
 * https://github.com/angular/angularfire/issues/3607
 * https://github.com/angular/angularfire/issues/3605
 * https://github.com/angular/angularfire/issues/3611
 * https://github.com/angular/angularfire/issues/3614
 * https://github.com/angular/angularfire/issues/3621
 */
setLogLevel(LogLevel.SILENT);

/**
 * Initializes the Firebase App using our configuration for the project.
 *
 * Both app.config.ts and the tests need to provide the FirebaseApp.
 */
export const provideOurFirebaseApp = (): EnvironmentProviders =>
  provideFirebaseApp(
    (): FirebaseApp =>
      initializeApp({
        apiKey: 'AIzaSyB75fqz0szrfVCLvpil9_t9UPQlLYplNcI',
        appId: '1:207926801743:web:e1402f665312fb7ab0813a',
        authDomain: 'brainfry-app.firebaseapp.com',
        messagingSenderId: '207926801743',
        projectId: 'brainfry-app',
        storageBucket: 'brainfry-app.appspot.com',
      }),
  );
