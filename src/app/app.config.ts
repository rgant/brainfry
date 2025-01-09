import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { ScreenTrackingService, UserTrackingService, getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { ReCaptchaEnterpriseProvider, initializeAppCheck, provideAppCheck } from '@angular/fire/app-check';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ apiKey: "AIzaSyB75fqz0szrfVCLvpil9_t9UPQlLYplNcI", appId: "1:207926801743:web:e1402f665312fb7ab0813a", authDomain: "brainfry-app.firebaseapp.com", messagingSenderId: "207926801743", projectId: "brainfry-app", storageBucket: "brainfry-app.appspot.com" })), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideAppCheck(() => {
  // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
  const provider = new ReCaptchaEnterpriseProvider('6LfG3rEqAAAAAK18S9UyMuK8wd3JSWjVnmDzmlrT');
  return initializeAppCheck(undefined, { isTokenAutoRefreshEnabled: true, provider });
}), provideFirestore(() => getFirestore()), provideFunctions(() => getFunctions()), providePerformance(() => getPerformance()), provideStorage(() => getStorage()), provideVertexAI(() => getVertexAI())]
};
