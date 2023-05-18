import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AzureDevopsAPIService } from '../services/azure-devops-api.service';
import { Buffer } from "buffer";

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';

type ProfileType = {
  givenName?: string,
  surname?: string,
  userPrincipalName?: string,
  id?: string
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile!: ProfileType;
  isUserAbleToRetrieveDevopsInfo: Boolean;
  private devopsService : AzureDevopsAPIService

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.getProfile();
    this.getDevopsPermit();
  }

  getProfile() {
    this.http.get(GRAPH_ENDPOINT)
      .subscribe(profile => {
        this.profile = profile;
      });
  }

  getDevopsPermit() {

    const header = new HttpHeaders({
      'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
    });

    this.http.get("https://vssps.dev.azure.com/multiAgentes/_apis/graph/users?api-version=7.0-preview.1", { headers: header }).subscribe((data: any) => {
      const mailAddressToCheck = this.profile.userPrincipalName;

      const isDisplayNamePresent = data.value.some(member => member.mailAddress === mailAddressToCheck);

      if (isDisplayNamePresent) {
        this.isUserAbleToRetrieveDevopsInfo = true;
        console.log(`${mailAddressToCheck} is present.`);
      } else {
        console.log(`${mailAddressToCheck} is not present.`);
        this.isUserAbleToRetrieveDevopsInfo = false;
      }

    });
  }

  getCalendar() {
    this.http.get('https://graph.microsoft.com/v1.0/me/calendar/events').subscribe(calendar => {
      console.log(calendar);
    });
  }

}