/* eslint-disable @angular-eslint/runtime-localize -- `Route.title`s may not be translated using `loadTranslations()` */
/* eslint-disable import-x/max-dependencies -- routes files tend to have a lot of dependencies */
import type { Routes } from '@angular/router';

import { authGuard, emailVerifiedGuard, noAuthGuard } from './core/guards';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ActionsComponent } from './identity/actions/actions.component';
import { ChangeEmailComponent } from './identity/change-email/change-email.component';
import { ChangePasswordComponent } from './identity/change-password/change-password.component';
import { ConfirmEmailComponent } from './identity/confirm-email/confirm-email.component';
import { ForgotPasswordComponent } from './identity/forgot-password/forgot-password.component';
import { LoginComponent } from './identity/login/login.component';
import { LogoutComponent } from './identity/logout/logout.component';
import { RecoverEmailComponent } from './identity/recover-email/recover-email.component';
import { ResetPasswordComponent } from './identity/reset-password/reset-password.component';
import { UserProfileComponent } from './identity/user-profile/user-profile.component';
import { VerifyEmailComponent } from './identity/verify-email/verify-email.component';
import { CentralLayoutComponent } from './layouts/central/central.component';
import { StandardLayoutComponent } from './layouts/standard/standard.component';
import { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './legal/terms-and-conditions/terms-and-conditions.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
  // Needs to be a destination inside authenticated area.
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },

  // Views outside of logged in area.
  {
    path: '',
    canActivateChild: [ noAuthGuard ],
    component: CentralLayoutComponent,

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
        title: $localize`:HTML title tag|Reset forgotten password@@htmlTitle.reset-password:Reset Password`,
      },
    ],
  },

  // Views inside of logged in area.
  {
    path: '',
    canActivateChild: [ authGuard, emailVerifiedGuard ],
    component: StandardLayoutComponent,

    children: [
      {
        path: 'change-email',
        component: ChangeEmailComponent,
        title: $localize`:HTML title tag|Change account email address@@htmlTitle.change-email:Change your email address`,
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        title: $localize`:HTML title tag|Change account password@@htmlTitle.change-password:Change your password`,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: $localize`:HTML title tag|Default page for user showing key information@@htmlTitle.dashboard:Dashboard`,
      },
      {
        path: 'logout',
        component: LogoutComponent,
        title: $localize`:HTML title tag|Logout of session@@htmlTitle.logout:Logout`,
      },
      {
        path: 'profile',
        component: UserProfileComponent,
        title: $localize`:HTML title tag|Page displaying your user profile@@htmlTitle.profile:Your Profile`,
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
    path: '',
    component: CentralLayoutComponent,

    children: [
      {
        // Sends the user an email to confirm access to the email address
        path: 'confirm-email',
        canActivate: [ authGuard ],
        component: ConfirmEmailComponent,
        title: $localize`:HTML title tag|Send email confirming address access@@htmlTitle.confirm-email:Confirm Email`,
      },
      {
        path: 'privacy',
        component: PrivacyPolicyComponent,
        title: $localize`:HTML title tag|Legal document page@@htmlTitle.privacy:Privacy Policy`,
      },
      {
        // Reverts a change of email address on the account
        path: 'recover-email',
        component: RecoverEmailComponent,
        title: $localize`:HTML title tag|Reverts email address change@@htmlTitle.recover-email:Recover Email`,
      },
      {
        path: 'terms',
        component: TermsAndConditionsComponent,
        title: $localize`:HTML title tag|Legal document page@@htmlTitle.terms:Terms & Conditions`,
      },
      {
        // Marks user account has having a verified email address
        path: 'verify-email',
        component: VerifyEmailComponent,
        title: $localize`:HTML title tag|Marks email address is verified@@htmlTitle.verify-email:Verify Email`,
      },
      {
        path: '**',
        component: PageNotFoundComponent,
        title: $localize`:HTML title tag|Page not found 404 error@@htmlTitle.not-found:Page Not Found`,
      },
    ],
  },
];
