import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { GeneralSecurity } from './generalSecurity';
import { Buffer } from "buffer";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Toolit';
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration, 
  private broadcastService: MsalBroadcastService, private authService: MsalService, private http: HttpClient) { }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;

    this.broadcastService.inProgress$
    .pipe(
      filter((status: InteractionStatus) => status === InteractionStatus.None),
      takeUntil(this._destroying$)
    )
    .subscribe(() => {
      this.setLoginDisplay();
      this.getDevopsPermit();
    })
  }

  login() {
    if (this.msalGuardConfig.authRequest){
      this.authService.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  logout() { // Add log out function here
    this.authService.logoutRedirect({
      postLogoutRedirectUri: 'https://toolitwebapp.web.app'
    });
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  getDevopsPermit() {

    const header = new HttpHeaders({
      'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
    });

    this.http.get("https://vssps.dev.azure.com/ToolitOrg/_apis/graph/users?api-version=7.0-preview.1", { headers: header }).subscribe((data: any) => {
      const mailAddressToCheck = this.authService.instance.getAllAccounts()[0].username;

      const isDisplayNamePresent = data.value.some(member => member.mailAddress === mailAddressToCheck);

      if (isDisplayNamePresent) {
        GeneralSecurity.isUserAbleToRetrieveDevopsInfo = true;
        console.log(`${mailAddressToCheck} is present.`);
      } else {
        console.log(`${mailAddressToCheck} is not present.`);
        GeneralSecurity.isUserAbleToRetrieveDevopsInfo = false;
      }

    });
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}