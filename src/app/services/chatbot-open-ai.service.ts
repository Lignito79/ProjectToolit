import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
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
      'Authorization': 'Bearer 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',
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
}