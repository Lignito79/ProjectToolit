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

  

  makeRequest(typeOperation: string, contentType: string, link: string, bodyPairs): Observable<any> {
    let now = new Date();
    const startOfDay = new Date(now.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setUTCHours(23, 59, 59, 999));
    
    // Format the start and end times as ISO 8601 strings
    const startTime = startOfDay.toISOString();
    const endTime = endOfDay.toISOString();

    if (typeOperation == "GET") {

      // Si el link obtenido se refiere a la solicitud de eventos de calendario por tiempo y fecha,
      // los valores "{start_dateTime}" y "{end_datetime}" se reemplazan por los valores pertinentes
      // tomando en cuenta lo que el chatbot nos proporcionó en el bory de su respuesta.
      if(link == "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime={start_datetime}&endDateTime={end_datetime}"){

        // En este caso, si el inicio y el fin de lo que se pide es hoy, entonces se reemplazan estos valores
        // por el inicio y el fin del día de hoy. (Probablemente habrá más condicionales)

        if(bodyPairs[0].value == "today" && bodyPairs[1].value == "today"){
          let newLink = link;

          newLink = link.replace('{start_datetime}', startTime);
          newLink = newLink.replace('{end_datetime}', endTime);

          console.log(newLink);

          return this.http.get(newLink);
        }
      }

      return this.http.get(link);

    } else if (typeOperation == "POST") {

      if (link == "https://graph.microsoft.com/v1.0/me/events"){
        let startTime: any;
        let endTime: any;

        if (bodyPairs[1].value == "today"){

          startTime = now;
          startTime.setHours(now.getHours() + 1);
          endTime = startTime;

        } else if ( !isNaN(bodyPairs[1].value) ){

          const addTime = parseInt(bodyPairs[1].value);
          startTime = now;
          startTime.setDate(now.getDate() + addTime);
          endTime = startTime;

        } else {
          let dateString = bodyPairs[1].value;
          let dateParts = dateString.split("/");
          let day = parseInt(dateParts[0]);
          let month = parseInt(dateParts[1]) - 1;
          let year = parseInt("20" + dateParts[2]);

          startTime = new Date(year, month, day);
          console.log(startTime);
          endTime = startTime;
        }

        endTime.setHours(endTime.getHours() + 1);

        const event = {
          subject: bodyPairs[0].value,
          start: {
              dateTime: startTime,
              timeZone: 'America/Mexico_City'
          },
          end: {
              dateTime: endTime,
              timeZone: 'America/Mexico_City'
          },
          allowNewTimeProposals: true
        };

        return this.http.post(link, event);
        
      }
      

    } else if (typeOperation == "GET") {

    }

  }
  
}
