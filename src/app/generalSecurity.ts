import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    template: ''
})
export abstract class GeneralSecurity {
    
  public static isUserAbleToRetrieveDevopsInfo: boolean;
  

}