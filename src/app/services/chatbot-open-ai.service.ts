import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Buffer } from "buffer";
import { BehaviorSubject } from 'rxjs/';

@Injectable({
  providedIn: 'root'
})

export class ChatbotOpenAIService {
  constructor(private http: HttpClient) { }
  apiURL = 'https://api.openai.com/v1/completions'

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env['NG_APP_KEY'],
    })
  }

  handleError(error : any) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  postCompletion(payload : any): Observable<any> {
    return this.http.post<any>(this.apiURL,JSON.stringify(payload),this.httpOptions)
    .pipe(
      retry(1),
      catchError(this.handleError)
    )
  }

  getWorkItems(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + Buffer.from(':' + '73anh3v4ksupnojrom6vuml7bofdrcqi5c4lnz7ci6mja6zpb3wa').toString('base64')
    });

    const body = {
      'query': 'SELECT [Id] from WorkItems'
    }

    return this.http.post('https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0', body ,{ headers: headers });
  }
}