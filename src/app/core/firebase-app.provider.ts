import type { EnvironmentProviders } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import type { FirebaseApp } from '@angular/fire/app';

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
