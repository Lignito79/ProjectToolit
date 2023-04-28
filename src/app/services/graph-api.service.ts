import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Buffer } from "buffer";
import { BehaviorSubject } from 'rxjs/';

@Injectable({
  providedIn: 'root'
})

export class GraphApiService {

  constructor(private http: HttpClient) { };

  now = new Date();
  startOfDay = new Date(this.now.setUTCHours(0, 0, 0, 0));
  endOfDay = new Date(this.now.setUTCHours(23, 59, 59, 999));
  
  // Format the start and end times as ISO 8601 strings
  startTime = this.startOfDay.toISOString();
  endTime = this.endOfDay.toISOString();

  makeRequest(typeOperation: string, contentType: string, link: string, bodyPairs): Observable<any> {

    if (typeOperation == "GET") {

      // Si el link obtenido se refiere a la solicitud de eventos de calendario por tiempo y fecha,
      // los valores "{start_dateTime}" y "{end_datetime}" se reemplazan por los valores pertinentes
      // tomando en cuenta lo que el chatbot nos proporcionó en el bory de su respuesta.
      if(link == "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime={start_datetime}&endDateTime={end_datetime}"){

        // En este caso, si el inicio y el fin de lo que se pide es hoy, entonces se reemplazan estos valores
        // por el inicio y el fin del día de hoy. (Probablemente habrá más condicionales)
        if(bodyPairs[0].value == "today" && bodyPairs[1].value == "today"){
          let newLink = link;

          newLink = link.replace('{start_datetime}', this.startTime);
          newLink = newLink.replace('{end_datetime}', this.endTime);

          return this.http.get(newLink);
        }
      }

      return this.http.get(link);

    } else if (typeOperation == "POST") {

    } else if (typeOperation == "GET") {

    }

  }
  
}
