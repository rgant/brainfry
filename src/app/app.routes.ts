import type { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ForgotPasswordComponent } from './login/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './login/reset-password.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
  // Needs to be a destination inside authenticated area.
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },

  // Views outside of logged in area.
  {
    path: '',
    canActivateChild: [ noAuthGuard ],
    children: [
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: $localize`:HTML title tag|Send password recover email@@pageTitle.forgot-password:Forgot Password`,
      },
      {
        path: 'login',
        component: LoginComponent,
        title: $localize`:HTML title tag|Login to application@@pageTitle.login:Login`,
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        title: $localize`:HTML title tag|Reset forgotten password@@pageTitle.reset-password:Login`,
      },
    ],
  },

  // Views inside of logged in area.
  {
    path: '',
    canActivateChild: [ authGuard ],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: $localize`:HTML title tag|Default page for user showing key information@@pageTitle.dashboard:Dashboard`,
      },
    ],
  },

  // Views for both logged in and out visitors
  {
    path: '**',
    component: PageNotFoundComponent,
    title: $localize`:HTML title tag|Page not found 404 error@@pageTitle.not-found:Page Not Found`,
  },
];
