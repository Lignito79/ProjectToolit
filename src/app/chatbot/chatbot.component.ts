import { Component, OnInit } from '@angular/core';
import { ChatbotOpenAIService } from '../services/chatbot-open-ai.service';
import { AzureDevopsAPIService } from '../services/azure-devops-api.service';
import { GraphApiService } from '../services/graph-api.service';
import { parsingHandler } from './parsingHandler';
import { Message } from './Message';

interface chatHistory {
  chatNum: number;
  questions: string[];
  answers: string[];
}

interface frequentQuestion {
  shortQuestion: string;
  query: string;
}

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

  result : string = "";
  query : string  = "";
  command: { link: string, body: { key: string, value: string }[] };
  commandQuery: string = "";
  counter = 1;
  currentChat = 0;
  chats = [];
  chatLog: chatHistory[];
  frequentQuestions : frequentQuestion[];
  
  public messages: Message[] = [
    {'role': 'system', 'content': 'You are a conversational chatbot assistant called Toolit. \
    Toolit is a knowledge management bot that uses individual employee and \
    company information with its agencies: Outlook and Azure DevOps. Toolit \
    is also integrated with the Azure DevOps and Graph APIs. \
    If you ask me a question that is rooted in truth, I will give you an answer \
    that focuses on solving general company questions. Have a conversation with \
    the user based on the queries provided. \
    It does not matter if I already asked you to create a command, just answer it like you already did.'},
    {'role': 'user', 'content': 'What are the company\'s policies and procedures regarding time off and vacation requests?'},
    {'role': 'assistant', 'content': 'The company\'s policies and procedures regarding time off and vacation requests are outlined in the employee handbook, which states that there\'s no such thing as "vacation" in this company.'},
    {'role': 'user', 'content': 'What are the company\'s policies regarding vacation days?'},
    {'role': 'assistant', 'content': 'There are no vacation days in this company.'},
    {'role': 'user', 'content': 'What are the company\'s policies on dress code?'},
    {'role': 'assistant', 'content': 'Regarding dress code, all employees and interns are required to dress as clowns during business hours.'},
    {'role': 'user', 'content': 'What resources are available to help me develop my skills and advance my career within the company?'},
    {'role': 'assistant', 'content': 'The company offers a variety of resources to help employees develop their skills and advance their careers. These include on-the-job training, mentorship programs, online courses, and professional development seminars. Additionally, the company offers tuition reimbursement for employees who wish to pursue higher education.'},
    {'role': 'user', 'content': 'Can you explain the company\'s retirement plan and how I can enroll or change my contributions?'},
    {'role': 'assistant', 'content': 'The company offers a 401(k) retirement plan to eligible employees. Employees can enroll in the plan by completing the enrollment form and submitting it to the Human Resources department. Employees can also change their contribution amounts at any time by submitting a new form. The company matches employee contributions up to a certain percentage.'},
    {'role': 'user', 'content': 'Give me all the work items from my Azure DevOps project called "MultiAgentesTC3004B.103"'},
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0", "body": [{"query": "SELECT [System.Title] from WorkItems"}]}'},
    {'role': 'user', 'content': 'Could you give me the work item with an ID of 12, from the project "MultiAgentesTC3004B.103"?'},
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/12?api-version=7.0", "body": []}'},
    {'role': 'user', 'content': 'What are the company\'s policies regarding remote work?'},
    {'role': 'assistant', 'content': 'The company has a flexible remote work policy. Employees can work remotely up to two days per week with manager approval. However, for certain roles that require on-site presence, remote work options may be limited.'},
    {'role': 'user', 'content': 'Give me the work item from my Azure DevOps project with an ID of 47 from the project "MultiAgentesTC3004B.103"'},
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/47?api-version=7.0", "body": []}'},
    {'role': 'user', 'content': 'Give me a list of all teams from my Azure DevOps organization'},
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/_apis/teams?api-version=7.0-preview.3", "body": []}'},
    {'role': 'user', 'content': 'Give me the recent work item activities from the Azure DevOps project "MultiAgentesTC3004B.103"'},
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0", "ContentType": "application/json", "body": []}'},
    {'role': 'user', 'content': 'Give me all the tasks from the project "MultiAgentesTC3004B.103" in a descending order'},
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0", "body": [{"query": "Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = \'Task\' order by [System.CreatedDate] desc"}]}'},
    {'role': 'user', 'content': 'Give me all the tasks from the project "MultiAgentesTC3004B.103" in an ascending order'},
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0", "body": [{"query": "Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = \'Task\' order by [System.CreatedDate] asc"}]}'},
    {'role': 'user', 'content': 'Create a new user story called "As a user I want to login" in the project "MultiAgentesTC3004B.103"'},
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "POST", "ContentType": "application/json-patch+json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/$User Story?api-version=7.0", "body": [[{"op":"add","path":"/fields/System.Title","from":null,"value":"As a user I want to login"}]]}'},
    {'role': 'user', 'content': 'Give me the recent work item activities from the project "MultiAgentesTC3004B.103"'},
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "GET", "link": "https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0", "body": []}'},
    {'role': 'user', 'content': 'Get me all my calendar events'},
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "GET", "link": "https://graph.microsoft.com/v1.0/me/calendar/events", "body": []}'},
    {'role': 'user', 'content': 'Get me all my calendar events from today'},
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "GET", "link": "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime={start_datetime}&endDateTime={end_datetime}", "body": [["start","today"],["end","today"]]}'},
    {'role': 'user', 'content': 'Give me my emails'},
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "GET", "link": "https://graph.microsoft.com/v1.0/me/messages?$select=sender,subject", "body": []}'},
    {'role': 'user', 'content': 'Create a calendar event called "Daily Meeting" for today'},
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Daily Meeting","start": {"dateTime": "0","timeZone": "America/Mexico_City"},"end": {"dateTime": "0","timeZone": "America/Mexico_City"},"allowNewTimeProposals": "true"}]}'},
    {'role': 'user', 'content': 'Create a calendar event called "Daily Meeting" for the next week'}, 
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Daily Meeting","start": {"dateTime": "7","timeZone": "America/Mexico_City"},"end": {"dateTime": "7","timeZone": "America/Mexico_City"},"allowNewTimeProposals": "true"}]}'}, 
    {'role': 'user', 'content': 'Create a calendar event called "Daily Meeting" for tomorrow'},
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Daily Meeting","start": {"dateTime": "1","timeZone": "America/Mexico_City"},"end": {"dateTime": "1","timeZone": "America/Mexico_City"},"allowNewTimeProposals": "true"}]}'},
    {'role': 'user', 'content': 'Create a calendar event called "Daily Meeting" for 24/06/23'},
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Daily Meeting","start": {"dateTime": "2023-06-24T12:00:00","timeZone": "America/Mexico_City"},"end": {"dateTime": "2023-06-24T13:00:00","timeZone": "America/Mexico_City"},"allowNewTimeProposals": "true"}]}'},
    {'role': 'user', 'content': 'Can you create a calendar appointment called "Event Test" with a00832436@tec.mx for 24/06/23?'},
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Event Test", "start": {"dateTime": "2023-06-24T12:00:00", "timeZone": "America/Mexico_City"}, "end": {"dateTime": "2023-06-24T12:00:00", "timeZone": "America/Mexico_City"}, "attendees": [{"emailAddress": {"address": "a00832436@tec.mx"}, "type": "required"}], "allowNewTimeProposals": true}]}'},
    {'role': 'user', 'content': 'Can you give me all work items from the "prueba1" project?'}, 
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/prueba1/_apis/wit/wiql?api-version=6.0", "body": [["query","SELECT [System.Title] from WorkItems"]]}'}, 
    {'role': 'user', 'content': 'Give me all members of the "multiAgentes" organization'}, 
    {'role': 'assistant', 'content': '{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://vssps.dev.azure.com/multiAgentes/_apis/graph/users?api-version=7.0-preview.1", "body": []}'}, 
    {'role': 'user', 'content': 'Can you delete a work item?'}, 
    {'role': 'assistant', 'content': 'Apologies, I am not able to delete work items or any other form of data from any service'}, 
    {'role': 'user', 'content': 'Can you delete a calendar event?'}, 
    {'role': 'assistant', 'content': 'Apologies, I am not able to delete calendar events or any other form of data from any service'}, 
    {'role': 'user', 'content': 'Can you delete the work item with an ID of 131 from the project called "MultiAgentesTC3004B.103"?'}, 
    {'role': 'assistant', 'content': 'I am not able to delete work items or any other form of data from any service.'},
    {'role': 'user', 'content': 'Can you give me the calendar events of the user with an email of a01284202@tec.mx on the date 2023/06/17 between 9 and 22 hours'},
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "GET", "link": "https://graph.microsoft.com/v1.0/users/a01284202@tec.mx/calendar/calendarView?startDateTime=2023-05-26T09:00:00&endDateTime=2023-05-26T22:00:00", "body": []}'},
    {'role': 'user', 'content': 'Can you tell me if A00832436@tec.mx is free on the date 2023/06/19 between 9 and 10 hours'},
    {'role': 'assistant', 'content': '{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/findMeetingTimes", "body": [{"attendees":[{"type":"required","emailAddress":{"address":"A00832436@tec.mx"}}],"locationConstraint":{"isRequired":false,"suggestLocation":false,"locations":[{"resolveAvailability":false,"displayName":"Conf room"}]},"timeConstraint":{"activityDomain":"work","timeSlots":[{"start":{"dateTime":"2023-05-26T09:00:00","timeZone":"Central America Standard Time"},"end":{"dateTime":"2023-05-26T10:00:00","timeZone":"Central America Standard Time"}}]},"isOrganizerOptional":"false","meetingDuration":"PT1H","returnSuggestionReasons":"true","minimumAttendeePercentage":"100"}]}'}
  ];

  ngOnInit(): void {
    this.chatLog = [
      { chatNum: 0, questions: [], answers: [] }
    ];

    this.frequentQuestions = [
      // "query" es el target
      { shortQuestion: "Codigo de Vestimenta", query: "asdf"},
      { shortQuestion: "Juntas", query: "fdsa"},
      { shortQuestion: "Tasks", query: "tyty"},
    ];
  }

  // Incremental chat
  incChat(){
    this.counter += 1;
    this.chats.push(this.counter)
  }

  setCurrentChat(target){
    this.currentChat = this.chats.indexOf(target)+1;

  }

  setCurrentChatDef(){
    this.currentChat = 0;
    console.log(this.currentChat)
  }
  
  frequentQuestionsClick(target){
    console.log(target)
    // this.postCompletion()
  }

  postCompletion(){
    
    this.messages.push({'role': 'user', 'content': `${this.query}`});

    var payload = { 
      model: "gpt-3.5-turbo", 
      messages: this.messages,
      temperature: 0,
      //max_tokens: 300,
      //top_p: 1,
      //frequency_penalty: 0,
      //presence_penalty: 0,
    }

    this.chatbot.postCompletion(payload).subscribe((data: any) => {
      // Podríamos llamar a processResponse aquí.
      this.processResponse(data, this.query);
    });
  }
  
  processResponse(data, query){
    let pairs;
    
    // Almacenamos el query generado por el chot en una variable
    this.commandQuery = data.choices[0].message.content;
    console.log(this.commandQuery);

    // La respuesta que da el bot se guarda directamente en el objeto de conversación
    this.messages.push(data.choices[0].message);


    console.log(this.commandQuery);
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(this.commandQuery);
      console.log(parsedResponse);

      try {
        pairs = this.devopsService.obtainPairs(parsedResponse);
      } catch {
        pairs = 1;
      }

      if (parsedResponse.service == "Graph"){
        this.processOutlookRequest(parsedResponse, pairs, query);
      } else if (parsedResponse.service == "DevOps"){
        this.processAzureDevOpsRequest(parsedResponse, pairs, query);
      }

    // Si hay un error parseando la respuesta del bot, significa que no regresó un JSON y por lo tanto
    // se imprime directamente en el chat sin procesarla
    } catch (error) {
      console.error(`Error parsing JSON on line '${this.commandQuery}': ${error}`);
      this.displayChat(query, this.commandQuery);
    } 
  }



  // Esta función sirve para procesar solicitudes a la API de Graph
  processOutlookRequest(parsedResponse, pairs, query){
    // Llamamos al "makeRequest" del servicio GraphApiService
    this.graphService.makeRequestOutlook(parsedResponse.type, parsedResponse.ContentType, parsedResponse.link, pairs, parsedResponse.body).subscribe((data: any) => {
      console.log(data);
      let stringResult = "";

      // Si lo obtenido tiene una propiedad llamada "value", entonces la respuesta es procesada considerando que lo que obtuvimos es una
      // lista de eventos del calendario del usuario
      if (data.hasOwnProperty("value") && data.value[0].hasOwnProperty("attendees")) {

        stringResult = parsingHandler.parseCalendarEventResponse(data);
        // Se despliega la respuesta en el chat
        this.displayChat(query, stringResult);
        return;

      } else if(data.hasOwnProperty("value") && data.value[1].hasOwnProperty("sender")){
        
        stringResult = parsingHandler.parseEmailsResponse(data);
        // Se despliega la respuesta en el chat
        this.displayChat(query, stringResult);
        return;

      } else if(data.hasOwnProperty("attendees")) {

        const stringResult = 'Subject: ' + data.subject + ', Description: ' + data.bodyPreview + ', Date and Time: ' + data.start['dateTime'];
        
        this.displayChat(query, stringResult);
        return;

      }
    });
  }


  processAzureDevOpsRequest(parsedResponse, pairs, query){

    this.devopsService.makeRequest(parsedResponse.type, parsedResponse.ContentType, parsedResponse.link, pairs, parsedResponse.body).subscribe((data: any) => {
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
          stringResult = parsingHandler.processAndParseWIQLResponse(dataWIB);
          // Insertar en el chat
          this.displayChat(query, stringResult);

        });
        return;    
        
      } else if (data.hasOwnProperty("fields")) {
        
        stringResult = parsingHandler.processSimpleWorkItemResponse(data);
        
        this.displayChat(query, stringResult);

        return;

      } else if (data.value[0].hasOwnProperty("activityType")) {

        stringResult = parsingHandler.processActivitiesResponse(data);          
        // Insertar en el chat
        this.displayChat(query, stringResult);
        return;

      } else if (data.value[0].hasOwnProperty("directoryAlias")){

        stringResult = parsingHandler.processDevOpsMembers(data);
        this.displayChat(query,stringResult);
        return;

      }
      // Se convierte el objeto obtenido en un string
      const stringResponse = JSON.stringify(data);
      console.log(stringResponse);

      // Se despliega en el chat el string obtenido
      this.displayChat(query, stringResponse);     
    });

  }

  displayChat( question, answer){
    this.chatLog.push({
      chatNum: this.currentChat,
      questions: [question],
      answers: [answer]
  });
  }

}


/*let responses = 
    `Q:What are the company's policies and procedures regarding time off and vacation requests?
    A:The company's policies and procedures regarding time off and vacation requests are outlined in the employee handbook, which states that there's no such thing as "vacation" in this company.
    
    Q:What are the company's policies regarding vacation days?
    A:There are no vacation days in this company.
    
    Q:What are the company's policies on dress code?
    A:Regarding dress code, all employees and interns are required to dress as clowns during business hours.
    
    Q:What resources are available to help me develop my skills and advance my career within the company?
    A: The company offers a variety of resources to help employees develop their skills and advance their careers. These include on-the-job training, mentorship programs, online courses, and professional development seminars. Additionally, the company offers tuition reimbursement for employees who wish to pursue higher education.
    
    Q:Can you explain the company's retirement plan and how I can enroll or change my contributions?
    A:The company offers a 401(k) retirement plan to eligible employees. Employees can enroll in the plan by completing the enrollment form and submitting it to the Human Resources department. Employees can also change their contribution amounts at any time by submitting a new form. The company matches employee contributions up to a certain percentage.
    
    Q:Give me all the work items from my Azure DevOps project called "MultiAgentesTC3004B.103"
    A:{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0", "body": [{"query": "SELECT [System.Title] from WorkItems"}]}
    
    Q:Could you give me the work item with an ID of 12, from the project "MultiAgentesTC3004B.103"?
    A:{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/12?api-version=7.0", "body": []}
    
    Q:Give me the work item from my Azure DevOps project with an ID of 47 from the project "MultiAgentesTC3004B.103"
    A: {"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/47?api-version=7.0", "body": []}
    
    Q:Give me a list of all teams from my Azure DevOps organization
    A: {"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/_apis/teams?api-version=7.0-preview.3", "body": []}
    
    Q:Give me the recent work item activities from the Azure DevOps project "MultiAgentesTC3004B.103"
    A:{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0", "ContentType": "application/json", "body": []}
    
    Q:Give me all the tasks from the project "MultiAgentesTC3004B.103" in a descending  order
    A:{"service": "DevOps", "type": "POST"", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0", "body": [{"query": "Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] desc"}]}
    
    Q:Give me all the tasks from the project "MultiAgentesTC3004B.103" in an ascending order
    A:{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0", "body": [{"query": "Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] asc"}]}
    
    Q:Create a new user story called "As a user I want to login" in the project "MultiAgentesTC3004B.103"
    A:{"service": "DevOps", "type": "POST", "ContentType": "application/json-patch+json", "link": "https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/$User Story?api-version=7.0", "body": [[{"op":"add","path":"/fields/System.Title","from":null,"value":"As a user I want to login"}]]}
    
    Q:Give me the recent work item activities from the project "MultiAgentesTC3004B.103"
    A:{"service": "DevOps", "type": "GET", "link": "https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0", "body": []}
    
    Q:Get me all my calendar events
    A:{"service": "Graph", "type": "GET", "link": "https://graph.microsoft.com/v1.0/me/calendar/events", "body": []}
    
    Q:Get me all my calendar events from today
    A:{"service": "Graph", "type": "GET", "link": "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime={start_datetime}&endDateTime={end_datetime}", "body": [["start","today"],["end","today"]]}
    
    Q:Give me my emails
    A:{"service": "Graph", "type": "GET", "link": "https://graph.microsoft.com/v1.0/me/messages?$select=sender,subject", "body": []}
    
    Q:Create a calendar event called "Daily Meeting" for today
    A:{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Daily Meeting","start": {"dateTime": "0","timeZone": "America/Mexico_City"},"end": {"dateTime": "0","timeZone": "America/Mexico_City"},"allowNewTimeProposals": "true"}]}
    
    Q:Create a calendar event called "Daily Meeting" for the next week
    A:{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Daily Meeting","start": {"dateTime": "7","timeZone": "America/Mexico_City"},"end": {"dateTime": "7","timeZone": "America/Mexico_City"},"allowNewTimeProposals": "true"}]}
    
    Q:Create a calendar event called "Daily Meeting" for tomorrow
    A:{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Daily Meeting","start": {"dateTime": "1","timeZone": "America/Mexico_City"},"end": {"dateTime": "1","timeZone": "America/Mexico_City"},"allowNewTimeProposals": "true"}]}
    
    Q:Create a calendar event called "Daily Meeting" for 24/06/23
    A:{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Daily Meeting","start": {"dateTime": "2023-06-24T12:00:00","timeZone": "America/Mexico_City"},"end": {"dateTime": "2023-06-24T13:00:00","timeZone": "America/Mexico_City"},"allowNewTimeProposals": "true"}]}
    
    Q:Can you create a calendar appointment called "Event Test" with a00832436@tec.mx for 24/06/23?
    A:{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Event Test", "start": {"dateTime": "2023-06-24T12:00:00", "timeZone": "America/Mexico_City"}, "end": {"dateTime": "2023-06-24T12:00:00", "timeZone": "America/Mexico_City"}, "attendees": [{"emailAddress": {"address": "a00832436@tec.mx"}, "type": "required"}], "allowNewTimeProposals": true}]}
    
    Q:Can you give me all work items from the "prueba1" project?
    A:{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/multiAgentes/prueba1/_apis/wit/wiql?api-version=6.0", "body": [["query","SELECT [System.Title] from WorkItems"]]}
    
    Q:Give me all members of the "multiAgentes" organization
    A:{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://vssps.dev.azure.com/multiAgentes/_apis/graph/users?api-version=7.0-preview.1", "body": []}
    
    Q:Can you delete a work item?
    A:Apologies, I am not able to delete work items or any other form of data from any service
    
    Q:Can you delete a calendar event?
    A:Apologies, I am not able to delete calendar events or any other form of data from any service
    
    Q:Can you delete the work item with an ID of 131 from the project called "MultiAgentesTC3004B.103"?
    A:Apologies, I am not able to delete work items or any other form of data from any service`;
    */
    /*
    let myprompt=
    `You are a conversational chatbot assistant called Toolit. 
    Toolit is a knowledge management bot that uses individual employee and \
    company information with its agencies: Outlook and Azure DevOps. Toolit \
    is also integrated with the Azure DevOps and Graph APIs. \
    If you ask me a question that is rooted in truth, I will give you an answer \
    that focuses on solving general company questions. Have a conversation with \
    the user based on the queries provided based \
    on the responses delimited by the brackets.
    Conversation: [${responses}]` + this.query + "\n";
    */
