import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, pairs, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { retry, catchError } from 'rxjs/operators';
import { Buffer } from "buffer";
import { BehaviorSubject } from 'rxjs/';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import * as jsonpatch from 'jsonpatch';


@Injectable({
  providedIn: 'root'
})

export class AzureDevopsAPIService {

  constructor(private http: HttpClient) {}

  stringResponse: any;
  static responseData: any;

  public headers = new HttpHeaders({
    'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
  });


  obtainPairs(parsedLine: any): Promise<Observable<any>> {
    let pairs: any;
      if (parsedLine.body.length == 0) {
        pairs = 1;
      } else if (parsedLine.link && parsedLine.body && Array.isArray(parsedLine.body)) {
        pairs = parsedLine.body.map((pair: [string, string]) => ({ key: pair[0], value: pair[1] }));
      }

    return pairs;
  }

  createBody(bodyPairs){
    
    let bodyString: string = "{"

      for (let i = 0; i < bodyPairs.length; i++){
        bodyString = bodyString + `"${bodyPairs[i].key}": "${bodyPairs[i].value}"`;

        if (i == bodyPairs.length-1) {
          bodyString = bodyString + "}";
        } else {
          bodyString = bodyString + ", ";
        }
      }

      return bodyString;
  }

  makeRequest(typeOperation: string, contentType: string, link: string, bodyPairs): Observable<any> {

    // Solo se necesita un body en llamadas POST y PATCH, no en GET.
    
    //------------------------------------------------------------------------------------------------
    // MÉTODO GET
    if (typeOperation == "GET"){
            
      return this.http.get(link, { headers: this.headers });
      
    //------------------------------------------------------------------------------------------------
    // MÉTODO POST. Si en el comando proporcionado por el bot se especifica que el body debe ser un json patch, se llama la funcion de
    // para crear uno. Si no, entonces se crea un "body" normal.
    } if(typeOperation == "POST"){

      // Se incluirá un content-type al header, y este será igual al valor de una variable con información que proporciona el bot.
      let headers;
      
      // Se crea un string de los diferentes elementos del body.
      let bodyString = this.createBody(bodyPairs);

      // Si el bot dice que el comando es de content-type JSON patch, entonces el body que nos da
      // se convierte en un JSON patch, conversión que se hace con concatenación de strings.
      // También se adapta el Header dependiendo del content-type.
      if(contentType == "application/json-patch+json"){
        // Esta conversión MUY seguramente se tendrá que modificar.
        bodyString = "[" + bodyString + "]";
        headers = new HttpHeaders({
          'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64'),
          'Content-Type': 'application/json-patch+json'
        });
      } else {
        headers = new HttpHeaders({
          'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
        });
      }

      // Se crea un JSON para el body a partir del string formado por los pares obtenidos y después de decidir si es un
      // Json patch o no.
      const body = JSON.parse(bodyString);
      
      console.log(body);
      
      return this.http.post(link, body, { headers: headers });


    //------------------------------------------------------------------------------------------------
    // MÉTODO PATCH. Por ahora es lo mismo que el POST.
    // Falta ver su implementación para las operaciones de edición.
    } else if (typeOperation == "PATCH"){

      const headers = new HttpHeaders({
        'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
      });

      // Se obtiene un json patch si es necesario
      const body = this.createBody(bodyPairs);
      
      console.log(body);
      
      return this.http.post(link, body, { headers: headers });

    }
    
  }
  

  getBatchWorkItems(workItemIDs: number[]): Observable<any> {
    const link = "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitemsbatch?api-version=7.0";

    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
    });

    const body = {
      "ids": workItemIDs,
      "fields": [
        "System.Id",
        "System.Title",
        "System.WorkItemType"
      ]
    }

    return this.http.post(link, body, { headers: headers }); 
  }
  
}

// Give me the work item from my Azure DevOps project with an ID of 47
    //{"type": "GET ", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/47?api-version=7.0", "body": []}

    // Give me the work item from my Azure DevOps project with an ID of 131
    //{"type": "GET ", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/131?api-version=7.0", "body": []}

    // Give me the work item from my Azure DevOps project with an ID of 71
    //{"type": "GET ", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/71?api-version=7.0", "body": []}

    // Give me a list of all teams from my Azure DevOps organization
    //{"type": "GET", "link": "https://dev.azure.com/multiAgentes/_apis/teams?api-version=7.0-preview.3", "body": []}

    // Give me the recent work item activities from my Azure DevOps
    //{"type": "GET", "link": "https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0", "body": []}

    // Give me all the tasks from my Azure DevOps in a descending order
    //{"type": "POST", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0", "body": [["query","Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] desc"]]}
    