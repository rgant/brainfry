/* eslint-disable @angular-eslint/runtime-localize -- `Route.title`s may not be translated using `loadTranslations()` */
/* eslint-disable import-x/max-dependencies -- routes files tend to have a lot of dependencies */
import type { Type as ComponentType } from '@angular/core';
import type { Routes } from '@angular/router';

import { authGuard, emailVerifiedGuard, noAuthGuard } from './core/guards';
import { DashboardComponent } from './dashboard/dashboard.component';
import type { ActionsComponent } from './identity/actions/actions.component';
import type { ChangeEmailComponent } from './identity/change-email/change-email.component';
import type { ChangePasswordComponent } from './identity/change-password/change-password.component';
import type { ConfirmEmailComponent } from './identity/confirm-email/confirm-email.component';
import type { DeleteAccountComponent } from './identity/delete-account/delete-account.component';
import type { ForgotPasswordComponent } from './identity/forgot-password/forgot-password.component';
import { LoginComponent } from './identity/login/login.component';
import type { LogoutComponent } from './identity/logout/logout.component';
import type { RecoverEmailComponent } from './identity/recover-email/recover-email.component';
import type { ResetPasswordComponent } from './identity/reset-password/reset-password.component';
import type { PhotoManagerComponent } from './identity/user-photos/photo-manager/photo-manager.component';
import type { UserProfileComponent } from './identity/user-profile/user-profile.component';
import type { VerifyEmailComponent } from './identity/verify-email/verify-email.component';
import { CentralLayoutComponent } from './layouts/central/central.component';
import { StandardLayoutComponent } from './layouts/standard/standard.component';
import type { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';
import type { TermsAndConditionsComponent } from './legal/terms-and-conditions/terms-and-conditions.component';
import type { PageNotFoundComponent } from './page-not-found/page-not-found.component';

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
        loadComponent: async (): Promise<ComponentType<ForgotPasswordComponent>> => {
          const mod = await import('./identity/forgot-password/forgot-password.component');
          return mod.ForgotPasswordComponent;
        },
        title: $localize`:HTML title tag|Send password recover email@@htmlTitle.forgot-password:Forgot Password`,
      },
      {
        path: 'login',
        component: LoginComponent,
        title: $localize`:HTML title tag|Login to application@@htmlTitle.login:Login`,
      },
      {
        path: 'reset-password',
        loadComponent: async (): Promise<ComponentType<ResetPasswordComponent>> => {
          const mod = await import('./identity/reset-password/reset-password.component');
          return mod.ResetPasswordComponent;
        },
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
        loadComponent: async (): Promise<ComponentType<ChangeEmailComponent>> => {
          const mod = await import('./identity/change-email/change-email.component');
          return mod.ChangeEmailComponent;
        },
        title: $localize`:HTML title tag|Change account email address@@htmlTitle.change-email:Change your email address`,
      },
      {
        path: 'change-password',
        loadComponent: async (): Promise<ComponentType<ChangePasswordComponent>> => {
          const mod = await import('./identity/change-password/change-password.component');
          return mod.ChangePasswordComponent;
        },
        title: $localize`:HTML title tag|Change account password@@htmlTitle.change-password:Change your password`,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: $localize`:HTML title tag|Default page for user showing key information@@htmlTitle.dashboard:Dashboard`,
      },
      {
        path: 'delete-account',
        loadComponent: async (): Promise<ComponentType<DeleteAccountComponent>> => {
          const mod = await import('./identity/delete-account/delete-account.component');
          return mod.DeleteAccountComponent;
        },
        title: $localize`:HTML title tag|Delete account@@htmlTitle.delete-account:Delete your account`,
      },
      {
        // Only Users with verified emails can logout. Is that the correct choice?
        path: 'logout',
        loadComponent: async (): Promise<ComponentType<LogoutComponent>> => {
          const mod = await import('./identity/logout/logout.component');
          return mod.LogoutComponent;
        },
        title: $localize`:HTML title tag|Logout of session@@htmlTitle.logout:Logout`,
      },
      {
        path: 'photos',
        loadComponent: async (): Promise<ComponentType<PhotoManagerComponent>> => {
          const mod = await import('./identity/user-photos/photo-manager/photo-manager.component');
          return mod.PhotoManagerComponent;
        },
        title: $localize`:HTML title tag|Page displaying profile photo uploads@@htmlTitle.photo:Your Photos`,
      },
      {
        path: 'profile',
        loadComponent: async (): Promise<ComponentType<UserProfileComponent>> => {
          const mod = await import('./identity/user-profile/user-profile.component');
          return mod.UserProfileComponent;
        },
        title: $localize`:HTML title tag|Page displaying your user profile@@htmlTitle.profile:Your Profile`,
      },
    ],
  },

  // Views for both logged in and out visitors
  {
    path: '',
    component: CentralLayoutComponent,

    children: [
      {
        // Redirects the user from the Firebase email to our custom action URLs
        path: 'actions',
        loadComponent: async (): Promise<ComponentType<ActionsComponent>> => {
          const mod = await import('./identity/actions/actions.component');
          return mod.ActionsComponent;
        },
        // title: '', // Redirect page with no need for title
      },
      {
        // Sends the user an email to confirm access to the email address
        path: 'confirm-email',
        canActivate: [ authGuard ],
        loadComponent: async (): Promise<ComponentType<ConfirmEmailComponent>> => {
          const mod = await import('./identity/confirm-email/confirm-email.component');
          return mod.ConfirmEmailComponent;
        },
        title: $localize`:HTML title tag|Send email confirming address access@@htmlTitle.confirm-email:Confirm Email`,
      },
      {
        path: 'privacy',
        loadComponent: async (): Promise<ComponentType<PrivacyPolicyComponent>> => {
          const mod = await import('./legal/privacy-policy/privacy-policy.component');
          return mod.PrivacyPolicyComponent;
        },
        title: $localize`:HTML title tag|Legal document page@@htmlTitle.privacy:Privacy Policy`,
      },
      {
        // Reverts a change of email address on the account
        path: 'recover-email',
        loadComponent: async (): Promise<ComponentType<RecoverEmailComponent>> => {
          const mod = await import('./identity/recover-email/recover-email.component');
          return mod.RecoverEmailComponent;
        },
        title: $localize`:HTML title tag|Reverts email address change@@htmlTitle.recover-email:Recover Email`,
      },
      {
        path: 'terms',
        loadComponent: async (): Promise<ComponentType<TermsAndConditionsComponent>> => {
          const mod = await import('./legal/terms-and-conditions/terms-and-conditions.component');
          return mod.TermsAndConditionsComponent;
        },
        title: $localize`:HTML title tag|Legal document page@@htmlTitle.terms:Terms & Conditions`,
      },
      {
        // Marks user account has having a verified email address
        path: 'verify-email',
        loadComponent: async (): Promise<ComponentType<VerifyEmailComponent>> => {
          const mod = await import('./identity/verify-email/verify-email.component');
          return mod.VerifyEmailComponent;
        },
        title: $localize`:HTML title tag|Marks email address is verified@@htmlTitle.verify-email:Verify Email`,
      },
      {
        path: '**',
        loadComponent: async (): Promise<ComponentType<PageNotFoundComponent>> => {
          const mod = await import('./page-not-found/page-not-found.component');
          return mod.PageNotFoundComponent;
        },
        title: $localize`:HTML title tag|Page not found 404 error@@htmlTitle.not-found:Page Not Found`,
      },
    ],
  },
];
