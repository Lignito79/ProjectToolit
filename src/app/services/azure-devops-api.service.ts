import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Buffer } from "buffer";
import { BehaviorSubject } from 'rxjs/';

@Injectable({
  providedIn: 'root'
})


export class AzureDevopsAPIService {

  constructor(private http: HttpClient) {}

  jsonLineCommand:string = '{"link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0", "body": [["query","SELECT [Id] from WorkItems"]]}'

  getWorkItems(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
    });

    const body = {
      'query': 'SELECT [Id] from WorkItems'
    }
    return this.http.post("https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0", body ,{ headers: headers });
  }
  
}
  