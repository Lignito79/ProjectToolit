import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ChatbotOpenAIService } from '../services/chatbot-open-ai.service';
import { AzureDevopsAPIService } from '../services/azure-devops-api.service';
import { GraphApiService } from '../services/graph-api.service';
import { ParsingHandler } from './parsingHandler';
import { GeneralSecurity } from '../generalSecurity';
import { Message } from './Message';
import { MessagesPerChat } from './messagesPerChat';

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
    private graphService: GraphApiService,
    private appComponent: AppComponent
  ) { }

  result : string = "";
  query : string  = "";
  command: { link: string, body: { key: string, value: string }[] };
  commandQuery: string = "";
  counter = 1;
  currentChat = 0;
  currentFAQ = 0;
  chats = [];
  chatLog: chatHistory[];
  frequentQuestions : frequentQuestion[];
  messagesOfAllChats: MessagesPerChat[];
  isTyping: boolean = false;
  

  ngOnInit(): void {
    this.chatLog = [
      { chatNum: 0, questions: [], answers: [] }
    ];

    this.messagesOfAllChats = [];

    this.messagesOfAllChats.push(new MessagesPerChat());

    console.log(this.messagesOfAllChats[0].messages);

    this.frequentQuestions = [
      // "query" es el target
      { shortQuestion: "Codigo de Vestimenta", query: "asdf"},
      { shortQuestion: "Juntas", query: "fdsa"},
      { shortQuestion: "Tasks", query: "tyty"},
    ];

    this.frequentQuestions = JSON.parse(localStorage.getItem("frequentQuestions"));
    //localStorage.setItem("frequentQuestions", JSON.stringify(this.frequentQuestions));
    
    
  }

  emptyChat(){
    let index = 0;
    // console.log(this.chatLog)
    for (let n of this.chatLog){
      index++;
      console.log(n.chatNum)
      console.log(this.currentChat)
      // if (n.chatNum == this.currentChat){
      //   this.chatLog.splice(index,1);
      //   console.log(index + 'hi')
      // }
      if (n.chatNum == this.currentChat){
        n.questions = [];
        n.answers = [];
        console.log(index + 'hi')
      }

      
    }
    // console.log(this.chatLog)
    
    // // this.chatLog.splice(this.currentChat,1);
    // console.log(this.currentChat)
    // console.log(this.chatLog)
  }

  storeFAQ(){
    localStorage.setItem("frequentQuestions", JSON.stringify(this.frequentQuestions));
    console.log("Local Storage:",localStorage.frequentQuestions);
  }

  getFAQ(){
    this.frequentQuestions = JSON.parse(localStorage.getItem("frequentQuestions"));
  }

  // Clic a un FAQ
  frequentQuestionsClick(target){
    console.log(target)
    // this.postCompletion()
  }

  setCurrentFAQ(target){
    this.currentFAQ = target;
    console.log(this.currentFAQ)

  }

  frequentQuestionEdit(){
    let sQuestion = document.getElementById('sQ') as HTMLInputElement;
    let lQuestion = document.getElementById("lQ") as HTMLInputElement;
    let sQuestionValue = sQuestion?.value;
    let lQuestionValue = lQuestion?.value;
    this.frequentQuestions[this.currentFAQ] = {
      shortQuestion: sQuestionValue,
      query: lQuestionValue
    }
    sQuestion.value = '';
    lQuestion.value = '';
  }

  // storeChat(){
  //   localStorage.setItem("chatLog", JSON.stringify(this.chatLog))
  //   console.log("Local Storage:",localStorage.chatLog)
  // }

  // getChat(){
  //   this.frequentQuestions = JSON.parse(localStorage.getItem("chatLog"))
  // }

  logout() { // Add log out function here
    this.appComponent.logout();
  }

  // Incremental chat
  incChat(){
    this.counter += 1;
    this.chats.push(this.counter);
    this.messagesOfAllChats.push(new MessagesPerChat);
  }

  setCurrentChat(target){
    this.currentChat = this.chats.indexOf(target)+1;

  }

  setCurrentChatDef(){
    this.currentChat = 0;
    console.log(this.currentChat)
  }

  countLines(lines): number {
    return lines.length;
  }

  isStringNull(str: string | null): boolean {
    return str === null;
  }

  postCompletion(){
    
    this.isTyping = true;
    this.messagesOfAllChats[this.currentChat].messages.push(
      {'role': 'user', 'content': `${this.query}`}
    );

    var payload = { 
      model: "gpt-3.5-turbo", 
      messages: this.messagesOfAllChats[this.currentChat].messages,
      temperature: 0.2
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
    let parsedResponse;
    let pairs;

    // Almacenamos el query generado por el bot en una variable
    this.commandQuery = data.choices[0].message.content;
    console.log(this.commandQuery);
    // La respuesta que da el bot se guarda directamente en el objeto de conversación
    this.messagesOfAllChats[this.currentChat].messages.push(data.choices[0].message);

    // console.log(this.messagesOfAllChats[this.currentChat].messages);
    //this.saveMessages(this.messages);

    // Contamos el número de lineas en el contenido que regresó el bot
    const lines = this.commandQuery.split('\n');
    const numLinesOfContent = this.countLines(lines);

    parsedResponse = this.parseResponse(lines[0], query);

    // Si el comando es de más de una línea, entonces significa que se va a agendar una cita
    // Si no, es un comando normal o sólo es una respuesta a una pregunta
    if (numLinesOfContent > 1){
      this.graphService.requestFindMeetingTimes(parsedResponse.link, parsedResponse.body).subscribe((data: any) => {
        console.log("Sí entró:")
        console.log(data);
        // Checar por qué está mal
        if(data.emptySuggestionsReason == ''){
          console.log("Sí está libre");
          parsedResponse = this.parseResponse(lines[1], query);
          this.decideProcess(parsedResponse, query);
        } else {
          this.displayChat(query, "Sorry, I could not find a free time slot for the meeting. Try with another date and time");
          return;
        }
      });
    } else {
      this.decideProcess(parsedResponse, query);
    }
    
  }

  parseResponse(commandQuery: string, query) {
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(commandQuery);
      console.log(parsedResponse);
    // Si hay un error parseando la respuesta del bot, significa que no regresó un JSON y por lo tanto
    // se imprime directamente en el chat sin procesarla
    } catch (error) {
      console.error(`Error parsing JSON on line '${commandQuery}': ${error}`);
      this.displayChat(query, commandQuery);
      return null;
    }

    console.log(commandQuery);
    return parsedResponse;    
    
  }

  decideProcess(parsedResponse, query){
    let pairs;

    try {
      pairs = this.devopsService.obtainPairs(parsedResponse);
    } catch {
      pairs = 1;
    }

    if(this.isStringNull(parsedResponse)){
      return;
    } else if (parsedResponse.service == "Graph"){
      this.processOutlookRequest(parsedResponse, pairs, query);
    } else if (parsedResponse.service == "DevOps"){
      this.processAzureDevOpsRequest(parsedResponse, pairs, query);
    }
  }


  // Esta función sirve para procesar solicitudes a la API de Graph
  processOutlookRequest(parsedResponse, pairs, query){
    // Llamamos al "makeRequest" del servicio GraphApiService
    this.graphService.makeRequestOutlook(parsedResponse.type, parsedResponse.ContentType, parsedResponse.link, pairs, parsedResponse.body).subscribe((data: any) => {
      console.log(data);
      let stringResult = "";

      // Si lo obtenido tiene una propiedad llamada "value"
      if (data.hasOwnProperty("value")) {
        if (data.value.length > 0 && typeof data.value[0] !== 'undefined'){
            if (data.value[0].hasOwnProperty("attendees")){
              stringResult = ParsingHandler.parseCalendarEventResponse(data);
              // Se despliega la respuesta en el chat
              this.displayChat(query, stringResult);
              return;
            } else if(data.value[1].hasOwnProperty("sender")){
              stringResult = ParsingHandler.parseEmailsResponse(data);
              // Se despliega la respuesta en el chat
              this.displayChat(query, stringResult);
              return;
            }
        } else {
          this.displayChat(query, "Sorry, I was not able to find the information you want");
          return;
        }
        
      } else if(data.hasOwnProperty("attendees")) {

        stringResult = '📂 Subject: ' + data.subject + '\n📝 Description: ' + data.bodyPreview + '\n📅 Date and Time: ' + data.start['dateTime'];
        
        this.displayChat(query, stringResult);
        return;

      } else if(data.hasOwnProperty("meetingTimeSuggestions")){

        if (data.emptySuggestionsReason == ""){
          stringResult = 'The attendees are available';
        } else {
          stringResult = 'The attendees are not available';
        }
        
        this.displayChat(query, stringResult);
        return;
      }
    });
  }

  processAzureDevOpsRequest(parsedResponse, pairs, query){
    
    if(!GeneralSecurity.isUserAbleToRetrieveDevopsInfo){
      this.displayChat(query,"You are unable to fetch information from the organization's Azure DevOps projects");
      return;
    }

    this.devopsService.makeRequest(parsedResponse.type, parsedResponse.ContentType, parsedResponse.link, pairs, parsedResponse.body).subscribe((data: any) => {
      console.log(data);

      // Expresión regular para hacer "match" con el string del link del comando del bot
      const regex = /^(https?:\/\/.*?\/.*?\/.*?)\/.*$/;
          
      // Se extrae la primera parte del link con la función "match"
      const match = parsedResponse.link.match(regex);
      
      // Se checa el match y se asigna el resultado en una variable
      const extractedString = match ? match[1] : '';
      
      // Primero que nada, verificamos si los datos obtenidos contienen un atributo llamado "workItems".
      // Esto para saber si tenemos que obtener los datos de cada ID de los workItems obtenidos por medio
      // de WiQl.
      let stringResult = "";
      if (data.hasOwnProperty("workItems")) {
        
        // Extraemos los IDs de cada work item obtenido
        const workItemIDs: number[] = data.workItems.map((product) => product.id);

        // Mandamos llamar la función especialmente hecha para obtener los datos
        // de varios work items en bache, tomando en cuenta sus IDs
        this.devopsService.getBatchWorkItems(workItemIDs, extractedString).subscribe((dataWIB: any) => {

          stringResult = ParsingHandler.processAndParseWIQLResponse(dataWIB, extractedString);
          // Insertar en el chat
          this.displayChat(query, stringResult);

        });
        return;    
        
      } else if (data.hasOwnProperty("fields")) {
        
        stringResult = ParsingHandler.processSimpleWorkItemResponse(data, extractedString);
        
        this.displayChat(query, stringResult);

        return;

      } else if (data.value[0].hasOwnProperty("activityType")) {

        stringResult = ParsingHandler.processActivitiesResponse(data, extractedString);          
        // Insertar en el chat
        this.displayChat(query, stringResult);
        return;

      } else if (data.value[0].hasOwnProperty("directoryAlias")){

        stringResult = ParsingHandler.processDevOpsMembers(data);
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
    this.isTyping = false;
    this.query = "";
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
    
    Q:Give me all the work items from my Azure DevOps project called "toolitDevelopment"
    A:{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/ToolitOrg/toolitDevelopment/_apis/wit/wiql?api-version=6.0", "body": [{"query": "SELECT [System.Title] from WorkItems"}]}
    
    Q:Could you give me the work item with an ID of 12, from the project "toolitDevelopment"?
    A:{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/ToolitOrg/toolitDevelopment/_apis/wit/workitems/12?api-version=7.0", "body": []}
    
    Q:Give me the work item from my Azure DevOps project with an ID of 47 from the project "toolitDevelopment"
    A: {"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/ToolitOrg/toolitDevelopment/_apis/wit/workitems/47?api-version=7.0", "body": []}
    
    Q:Give me a list of all teams from my Azure DevOps organization
    A: {"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/ToolitOrg/_apis/teams?api-version=7.0-preview.3", "body": []}
    
    Q:Give me the recent work item activities from the Azure DevOps project "toolitDevelopment"
    A:{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://dev.azure.com/ToolitOrg/_apis/work/accountmyworkrecentactivity?api-version=7.0", "ContentType": "application/json", "body": []}
    
    Q:Give me all the tasks from the project "toolitDevelopment" in a descending  order
    A:{"service": "DevOps", "type": "POST"", "ContentType": "application/json", "link": "https://dev.azure.com/ToolitOrg/toolitDevelopment/_apis/wit/wiql?api-version=7.0", "body": [{"query": "Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] desc"}]}
    
    Q:Give me all the tasks from the project "toolitDevelopment" in an ascending order
    A:{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/ToolitOrg/toolitDevelopment/_apis/wit/wiql?api-version=7.0", "body": [{"query": "Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] asc"}]}
    
    Q:Create a new user story called "As a user I want to login" in the project "toolitDevelopment"
    A:{"service": "DevOps", "type": "POST", "ContentType": "application/json-patch+json", "link": "https://dev.azure.com/ToolitOrg/toolitDevelopment/_apis/wit/workitems/$User Story?api-version=7.0", "body": [[{"op":"add","path":"/fields/System.Title","from":null,"value":"As a user I want to login"}]]}
    
    Q:Give me the recent work item activities from the project "toolitDevelopment"
    A:{"service": "DevOps", "type": "GET", "link": "https://dev.azure.com/ToolitOrg/_apis/work/accountmyworkrecentactivity?api-version=7.0", "body": []}
    
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
    
    Q:Can you create a calendar appointment called "Event Test" with A00832436@tec.mx for 24/06/23?
    A:{"service": "Graph", "type": "POST", "link": "https://graph.microsoft.com/v1.0/me/events", "body": [{"subject": "Event Test", "start": {"dateTime": "2023-06-24T12:00:00", "timeZone": "America/Mexico_City"}, "end": {"dateTime": "2023-06-24T12:00:00", "timeZone": "America/Mexico_City"}, "attendees": [{"emailAddress": {"address": "A00832436@tec.mx"}, "type": "required"}], "allowNewTimeProposals": true}]}
    
    Q:Can you give me all work items from the "toolitProject2" project?
    A:{"service": "DevOps", "type": "POST", "ContentType": "application/json", "link": "https://dev.azure.com/ToolitOrg/toolitProject2/_apis/wit/wiql?api-version=6.0", "body": [["query","SELECT [System.Title] from WorkItems"]]}
    
    Q:Give me all members of the "ToolitOrg" organization
    A:{"service": "DevOps", "type": "GET", "ContentType": "application/json", "link": "https://vssps.dev.azure.com/ToolitOrg/_apis/graph/users?api-version=7.0-preview.1", "body": []}
    
    Q:Can you delete a work item?
    A:Apologies, I am not able to delete work items or any other form of data from any service
    
    Q:Can you delete a calendar event?
    A:Apologies, I am not able to delete calendar events or any other form of data from any service
    
    Q:Can you delete the work item with an ID of 131 from the project called "toolitDevelopment"?
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