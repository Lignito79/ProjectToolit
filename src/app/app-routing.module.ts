import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserUtils } from '@azure/msal-browser';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { ChatbotComponent } from './chatbot/chatbot.component';

import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch:'full'

  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'chatbot',
    component: ChatbotComponent,
    canActivate: [MsalGuard],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch:'full'

  },
];

const isIframe = window !== window.parent && !window.opener;

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Don't perform initial navigation in iframes or popups
   initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled' // Set to enabledBlocking to use Angular Universal
  
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const APP_ROUTES = RouterModule.forRoot(routes);