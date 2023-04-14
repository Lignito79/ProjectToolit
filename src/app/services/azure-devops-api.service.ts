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
    
    this.makeRequest(parsedLine.type, parsedLine.link, pairs).subscribe((data: any) => {
	    console.log(data);
    });

    return parsedLine;
  }

  makeRequest(typeOperation: string, link: string, bodyPairs): Observable<any> {
    
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + Buffer.from(':' + process.env['NG_APP_TOK']).toString('base64')
    });

    // Solo se necesita un body en llamadas POST y no en GET.    

    if(typeOperation == "POST"){    
      
      const bodyString = `{"${bodyPairs[0].key}": "${bodyPairs[0].value}"}`
    
      const body = JSON.parse(bodyString);
      
      return this.http.post(link, body, { headers: headers });

    } else if (typeOperation == "GET"){
      
      return this.http.get(link, { headers: headers });

    } else if (typeOperation == "PATCH"){

      // Hacer un FOR que recorra el array de pares para crear un body de varias líneas o parámetros
      const bodyString = `{"${bodyPairs[0].key}": "${bodyPairs[0].value}"}`
    
      const body = JSON.parse(bodyString);

      return this.http.patch(link, body, { headers: headers });

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
    