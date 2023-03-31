
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/';
  
export class AzureDevopsAPIService {
  private apiUrl = 'https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/30?api-version=7.0';

  constructor(private http: HttpClient) {}

  getWorkItems(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + Buffer.from("zg3fznfjhxpg7euobdvhxckaeqisalpusokyx7a7bhzpughowlpa", 'base64')
    });

    return this.http.get(this.apiUrl, { headers: headers });
  }
}
  