import { Component, OnInit } from '@angular/core';
import { ChatbotOpenAIService } from '../services/chatbot-open-ai.service';
import { AzureDevopsAPIService } from '../services/azure-devops-api.service';
import { GraphApiService } from '../services/graph-api.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})

export class ChatbotComponent implements OnInit {
  constructor(
    private chatbot : ChatbotOpenAIService, 
    private devopsService : AzureDevopsAPIService,
    private graphService: GraphApiService
    ) { }

  ngOnInit(): void {
  }

  result : string = "";
  query : string  = "";
  results: string[] = [];
  queries: string[] = [];
  command: { link: string, body: { key: string, value: string }[] };
  commandQuery: string = "";
  

  postCompletion(){

    let myprompt="I am an highly intelligent question-answering bot called Toolit. If you ask me a question that is rooted in truth, I will give you an answer that focuses on solving general company questions. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with \"I do not know.\" Toolit is also integrated with the Azure DevOps and Graph APIs. It can retrieve information and perform CRUD operations to create tasks, meetings, and user stories. among others\n\nQ:What are the company's policies and procedures regarding time off and vacation requests?\nA:The company's policies and procedures regarding time off and vacation requests are outlined in the employee handbook, which states that there's no such thing as \"vacation\" in this company.\n\nQ:What are the company's policies regarding vacation days?\nA:There are no vacation days in this company.\n\nQ:What are the company's policies on dress code?\nA:Regarding dress code, all employees and interns are required to dress as clowns during business hours.\n\nQ:What resources are available to help me develop my skills and advance my career within the company?\nA: The company offers a variety of resources to help employees develop their skills and advance their careers. These include on-the-job training, mentorship programs, online courses, and professional development seminars. Additionally, the company offers tuition reimbursement for employees who wish to pursue higher education.\n\nQ:Can you explain the company's retirement plan and how I can enroll or change my contributions?\nA:The company offers a 401(k) retirement plan to eligible employees. Employees can enroll in the plan by completing the enrollment form and submitting it to the Human Resources department. Employees can also change their contribution amounts at any time by submitting a new form. The company matches employee contributions up to a certain percentage.\n\nQ:Give me all the work items from my Azure DevOps.\nA:{\"service\": \"DevOps\", \"type\": \"POST\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0\", \"body\": [[\"query\",\"SELECT [System.Title] from WorkItems\"]]}\n\nQ:Could you give me the work item with an ID of 12?\nA:{\"service\": \"DevOps\", \"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/12?api-version=7.0\", \"body\": []}\n\nQ:Give me the work item from my Azure DevOps project with an ID of 47\nA: {\"service\": \"DevOps\", \"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/47?api-version=7.0\", \"body\": []}\n\nQ:Give me a list of all teams from my Azure DevOps organization\nA: {\"service\": \"DevOps\", \"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/_apis/teams?api-version=7.0-preview.3\", \"body\": []}\n\nQ:Give me the recent work item activities from my Azure DevOps\nA:{\"service\": \"DevOps\", \"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0\", \"ContentType\": \"application/json\", \"body\": []}\n\nQ:Give me all the tasks from my Azure DevOps in a descending  order\nA:{\"service\": \"DevOps\", \"type\": \"POST\"\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0\", \"body\": [[\"query\",\"Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] desc\"]]}\n\nQ:Give me all the tasks from my Azure DevOps in an ascending order\nA:{\"service\": \"DevOps\", \"type\": \"POST\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0\", \"body\": [[\"query\",\"Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] asc\"]]}\n\nQ:Create a new user story called \"As a user I want to login\"\nA:{\"service\": \"DevOps\", \"type\": \"POST\", \"ContentType\": \"application/json-patch+json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/$User Story?api-version=7.0\", \"body\": [[\"op\",\"add\"],[\"path\",\"/fields/System.Title\"],[\"from\",\"null\"],[\"value\",\"As a user I want to login.\"]]}\n\nQ:Give me the recent work item activities from my Azure DevOps\nA:{\"service\": \"DevOps\", \"type\": \"GET\", \"link\": \"https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0\", \"body\": []}\n\nQ:Get me all my calendar events\nA:{\"service\": \"Graph\", \"type\": \"GET\", \"link\": \"https://graph.microsoft.com/v1.0/me/calendar/events\", \"body\": []}\n\nQ:Get me all my calendar events from today\nA:{\"service\": \"Graph\", \"type\": \"GET\", \"link\": \"https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime={start_datetime}&endDateTime={end_datetime}\", \"body\": [[\"start\",\"today\"],[\"end\",\"today\"]]}\n\nQ:Give me my emails\nA:{\"service\": \"Graph\", \"type\": \"GET\", \"link\": \"https://graph.microsoft.com/v1.0/me/messages?$select=sender,subject\", \"body\": []}\n\nQ:Create a calendar event called \"Daily Meeting\" for today\nA:{\"service\": \"Graph\", \"type\": \"POST\", \"link\": \"https://graph.microsoft.com/v1.0/me/events\", \"body\": [[\"subject\",\"Daily Meeting\"],[\"start\",\"today\"],[\"end\",\"today\"]]}\n\nQ:Create a calendar event called \"Daily Meeting\" for the next week\nA:{\"service\": \"Graph\", \"type\": \"POST\", \"link\": \"https://graph.microsoft.com/v1.0/me/events\", \"body\": [[\"subject\",\"Daily Meeting\"],[\"start\",\"7\"],[\"end\",\"7\"]]}\n\nQ:Create a calendar event called \"Daily Meeting\" for tomorrow\nA:{\"service\": \"Graph\", \"type\": \"POST\", \"link\": \"https://graph.microsoft.com/v1.0/me/events\", \"body\": [[\"subject\",\"Daily Meeting\"],[\"start\",\"1\"],[\"end\",\"1\"]]}\n\nQ:Create a calendar event called \"Daily Meeting\" for 24/06/23\nA:{\"service\": \"Graph\", \"type\": \"POST\", \"link\": \"https://graph.microsoft.com/v1.0/me/events\", \"body\": [[\"subject\",\"Daily Meeting\"],[\"start\",\"24/06/23\"],[\"end\",\"24/06/23\"]]}\n\nQ:" + this.query + "\n";

    // let myprompy = "";

    var payload = { 
      model: "text-davinci-003", 
      prompt: myprompt,
      temperature: 0,
      max_tokens: 300,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }

    this.queries.push(this.query)

    this.chatbot.postCompletion(payload).subscribe((data: any) => {
      this.processResponse(data);
    });
  }
  
  processResponse(data){

    this.commandQuery = data.choices[0].text.replace('A:','');
    
    console.log(this.commandQuery);
    
    try {
      let parsedResponse = JSON.parse(this.commandQuery);
      const pairs = this.devopsService.obtainPairs(parsedResponse);
      
      if (parsedResponse.service == "Graph"){
        this.processOutlookRequest(parsedResponse, pairs);
      } else if (parsedResponse.service == "DevOps"){
        this.processAzureDevOpsRequest(parsedResponse, pairs);
      }

    // Si hay un error parseando la respuesta del bot, significa que no regresó un JSON y por lo tanto
    // se imprime directamente en el chat sin procesarla
    } catch (error) {
      console.error(`Error parsing JSON on line '${this.commandQuery}': ${error}`);
      this.results.push(this.commandQuery);
    }
  }

  // Esta función sirve para procesar solicitudes a la API de Graph
  processOutlookRequest(parsedResponse, pairs){

    // Llamamos al "makeRequest" del servicio GraphApiService
    this.graphService.makeRequest(parsedResponse.type, parsedResponse.ContentType, parsedResponse.link, pairs).subscribe((data: any) => {
      console.log(data);
      let stringResult = "";

      // Si lo obtenido tiene una propiedad llamada "value", entonces la respuesta es procesada considerando que lo que obtuvimos es una
      // lista de eventos del calendario del usuario

      // AQUÍ FALTA PONER UN AND PARA SABER SI ESTOY IMPRIMIENDO CALENDARIOS O EMAILS. PARSEAR RESPUESTAS
      if (data.hasOwnProperty("value") && data.value[0].hasOwnProperty("attendees")) {
        // Vamos almacenando los datos de cada valor del objeto obtenido por el request en un string
        data.value.forEach(function (item) {
          // Concatenamos los datos que nos interesan. OJO. Probablemente lo que haremos es separar la fecha y la hora.
          const eachResultString = 'Subject: ' + item.subject + ', Description: ' + item.bodyPreview + ', Date and Time: ' + item.start['dateTime'] + '\n';
          stringResult = stringResult + eachResultString + '\n';
        });

        // Se despliega la respuesta en el chat
        this.results.push(stringResult);

        return;
      } else if(data.hasOwnProperty("value") && data.value[1].hasOwnProperty("sender")){

        console.log('Entro');
        // Vamos almacenando los datos de cada valor del objeto obtenido por el request en un string
        data.value.forEach(function (item) {
          let eachResultString: string;
          // Concatenamos los datos que nos interesan. OJO. Probablemente lo que haremos es separar la fecha y la hora.
          if(item.hasOwnProperty("sender")){
            eachResultString = 'Subject: ' + item.subject + ', Sender name: ' + item.sender.emailAddress.name + ', Sender address: ' + item.sender.emailAddress.name  + '\n';
          }

          stringResult = stringResult + eachResultString + '\n';
        });

        // Se despliega la respuesta en el chat
        this.results.push(stringResult);
        return;

      } else if(data.hasOwnProperty("attendees")) {

        const stringResult = 'Subject: ' + data.subject + ', Description: ' + data.bodyPreview + ', Date and Time: ' + data.start['dateTime'];
        
        this.results.push(stringResult);
        return;

      }

      
    });
  }

  processAzureDevOpsRequest(parsedResponse, pairs){

    this.devopsService.makeRequest(parsedResponse.type, parsedResponse.ContentType, parsedResponse.link, pairs).subscribe((data: any) => {
      console.log(data);
      
      // Primero que nada, verificamos si los datos obtenidos contienen un atributo llamado "workItems".
      // Esto para saber si tenemos que obtener los datos de cada ID de los workItems obtenidos por medio
      // de WiQl.
      let stringResult = "";
      if (data.hasOwnProperty("workItems")) {
        
        // Extraemos los IDs de cada work item obtenido
        const workItemIDs: number[] = data.workItems.map((product) => product.id);

        // Mandamos llamar la función especialmente hecha para obtener los datos
        // de varios work items en bache, tomando en cuenta sus IDs
        this.devopsService.getBatchWorkItems(workItemIDs).subscribe((dataWIB: any) => {

          // Hacer for que recorre los workitems y los almacena en un string bonito :)
          dataWIB.value.forEach(function (item) {
            
            const eachResultString = 'ID: ' + item.id + ', Title: ' + item.fields['System.Title'] + ', Work item type: ' + item.fields['System.WorkItemType'] + '\n';

            stringResult = stringResult + eachResultString + '\n';
          });


          console.log(stringResult);
          
          // Insertar en el chat
          this.results.push(stringResult);

        });
        return;    
        
      } else if (data.hasOwnProperty("fields")) {
        
        stringResult = "ID: " + data.id + ", Title: " + data.fields['System.Title'] + ", Work item type: " + data.fields['System.WorkItemType'] + 
        ", Created By: " + data.fields['System.CreatedBy'].displayName;
        
        console.log(stringResult);
        this.results.push(stringResult);

        return;

      } else if (data.value[0].hasOwnProperty("activityType")) {
        
        const resultsBatch = data.value.map(item => ({
          id: item.id,
          title: item.title,
          activityType: item.activityType,
          activityDate: item.activityDate,
          workItemType: item.workItemType
        }));

        resultsBatch.forEach(function (value) {
          if(value.activityType != "visited"){
            const eachResultString = 'ID: ' + value.id + ', Title: ' + value.title + ', Work item type: ' + value.workItemType + 
            ', Activity Type: ' + value.activityType + ', Activity Date: ' + value.activityDate + '\n';

            stringResult = stringResult + eachResultString + '\n';
          }
        });

          console.log(stringResult);
          
          // Insertar en el chat
          this.results.push(stringResult);

          return;
      }
      // Se convierte el objeto obtenido en un string
      const stringResponse = JSON.stringify(data);
      console.log(stringResponse);

      // Se despliega en el chat el string obtenido
      this.results.push(stringResponse);        
    });

  }
}
