/* eslint-disable import-x/max-dependencies -- routes files tend to have a lot of dependencies */
import type { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ActionsComponent } from './identity/actions/actions.component';
import { ConfirmEmailComponent } from './identity/confirm-email/confirm-email.component';
import { ForgotPasswordComponent } from './identity/forgot-password/forgot-password.component';
import { LoginComponent } from './identity/login/login.component';
import { RecoverEmailComponent } from './identity/recover-email/recover-email.component';
import { ResetPasswordComponent } from './identity/reset-password/reset-password.component';
import { VerifyEmailComponent } from './identity/verify-email/verify-email.component';
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
        title: $localize`:HTML title tag|Send password recover email@@htmlTitle.forgot-password:Forgot Password`,
      },
      {
        path: 'login',
        component: LoginComponent,
        title: $localize`:HTML title tag|Login to application@@htmlTitle.login:Login`,
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        title: $localize`:HTML title tag|Reset forgotten password@@htmlTitle.reset-password:Login`,
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
        title: $localize`:HTML title tag|Default page for user showing key information@@htmlTitle.dashboard:Dashboard`,
      },
      {
        // Sends the user an email to confirm access to the email address
        path: 'confirm-email',
        component: ConfirmEmailComponent,
        title: $localize`:HTML title tag|Send email confirming address access@@htmlTitle.confirm-email:Confirm Email`,
      },
    ],
  },

  // Views for both logged in and out visitors
  {
    // Redirects the user from the Firebase email to our custom action URLs
    path: 'actions',
    component: ActionsComponent,
    // title: '', // Redirect page with no need for title
  },
  {
    // Marks user account has having a verified email address
    path: 'verify-email',
    component: VerifyEmailComponent,
    title: $localize`:HTML title tag|Marks email address is verified@@htmlTitle.verify-email:Verify Email`,
  },
  {
    // Undoes a change of email address on the account
    path: 'recover-email',
    component: RecoverEmailComponent,
    title: $localize`:HTML title tag|Reverts email address change@@htmlTitle.recover-email:Recover Email`,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    title: $localize`:HTML title tag|Page not found 404 error@@htmlTitle.not-found:Page Not Found`,
  },
];
