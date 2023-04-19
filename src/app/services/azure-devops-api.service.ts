import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, pairs, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Buffer } from "buffer";
import { BehaviorSubject } from 'rxjs/';
import * as jsonpatch from 'jsonpatch';


@Injectable({
  providedIn: 'root'
})


export class AzureDevopsAPIService {

  constructor(private http: HttpClient) {}

  getWorkItems(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
    });

    const body = {
      'query': 'SELECT [Id] from WorkItems'
    }

    return this.http.post("https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0", body ,{ headers: headers });
  }


  parseJson(jsonLines: string): { type: string, link: string, body: { key: string, value: string }[] } {
    // Esto es para una sola línea, no varias
    const parsedLine = JSON.parse(jsonLines);
    let pairs;

    try {
      
      if (parsedLine.body.length == 0) {
        pairs = 1;
      } else if (parsedLine.link && parsedLine.body && Array.isArray(parsedLine.body)) {
        pairs = parsedLine.body.map((pair: [string, string]) => ({ key: pair[0], value: pair[1] }));
      }

    } catch (error) {
      console.error(`Error parsing JSON on line '${jsonLines}': ${error}`);
    }
    
    this.makeRequest(parsedLine.type, parsedLine.ContentType, parsedLine.link, pairs).subscribe((data: any) => {
	    console.log(data);
    });

    return parsedLine;
  }

  createBody(bodyPairs){
    //SI FUNCIONA PARA CREAR UN PATCH
    //let bodyString: string = "[ {"
    let bodyString: string = "{"

      for (let i = 0; i < bodyPairs.length; i++){
        bodyString = bodyString + `"${bodyPairs[i].key}": "${bodyPairs[i].value}"`;

        if (i == bodyPairs.length-1) {
          //SI FUNCIONA PARA CREAR UN PATCH
          //bodyString = bodyString + "} ]";
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

      const headers = new HttpHeaders({
        'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
      });
      
      return this.http.get(link, { headers: headers });


    //------------------------------------------------------------------------------------------------
    // MÉTODO POST. Si en el comando proporcionado por el bot se especifica que el body debe ser un json patch, se llama la funcion de
    // para crear uno. Si no, entonces se crea un "body" normal.
    } if(typeOperation == "POST"){

      // Se incluirá un content-type al header, y este será igual al valor de una variable con información que proporciona el bot.
      let headers;
      
      // AQUÍ SE PONDRÁ UN IF. SI EL BOT DICE QUE EL CONTENT-TYPE ES JSON PATCH, SE CONVIERTE EL BODY OBTENIDO
      // A UN DOCUMENTO JSON PATCH (LA CONVERSIÓN SE HARÁ SÓLO CON CONCATENACIÓN DE STRINGS :D).

      let bodyString = this.createBody(bodyPairs);

      if(contentType == "application/json-patch+json"){
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

      const body = JSON.parse(bodyString);

      // Se crea un body a partir del string formado por los pares obtenidos y después de decidir si es un
      // Json patch o no.
      
      console.log(body);
      
      return this.http.post(link, body, { headers: headers });


    //------------------------------------------------------------------------------------------------
    // MÉTODO PATCH. Por ahora es lo mismo que el POST.
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
    