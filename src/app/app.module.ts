import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http"; // Import
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { MsalModule, MsalRedirectComponent, MsalGuard, MsalInterceptor } from '@azure/msal-angular'; // Import MsalInterceptor
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { ChatbotComponent } from './chatbot/chatbot.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ReactiveFormsModule} from '@angular/forms';
import { ClearChatService } from './clear-chat.service';




const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
    ChatbotComponent
  ],
  imports: [
    BrowserModule,
    BsDropdownModule.forRoot(),
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MsalModule.forRoot( new PublicClientApplication({
      auth: {
        clientId: 'ddb3d3d8-5eae-4059-8e75-004a9f96555a', // Application (client) ID from the app registration
        authority: 'https://login.microsoftonline.com/common', // The Azure cloud instance and the app's sign-in audience (tenant ID, common, organizations, or consumers)
        redirectUri: 'http://localhost:4200'// This is your redirect URI
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: isIE,
      }
    }), {
      interactionType: InteractionType.Redirect,
      authRequest: {
        scopes: ['user.read', 'calendars.readwrite', 'mailboxsettings.read', 'mail.read', 'mail.readwrite']
        }
    }, {
      interactionType: InteractionType.Redirect, // MSAL Interceptor Configuration
      protectedResourceMap: new Map([ 
          ['https://graph.microsoft.com', ['user.read']]
      ])
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalGuard,
    ChatbotComponent,
    ClearChatService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})

export class AppModule { }



