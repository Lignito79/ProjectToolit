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
  }

  getProfile() {
    this.http.get(GRAPH_ENDPOINT)
      .subscribe(profile => {
        this.profile = profile;
      });
  }

  getCalendar() {
    this.http.get('https://graph.microsoft.com/v1.0/me/calendar/events').subscribe(calendar => {
      console.log(calendar);
    });
  }

}