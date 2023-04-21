import { Component, OnInit } from '@angular/core';
import { ChatbotOpenAIService } from '../services/chatbot-open-ai.service';
import { AzureDevopsAPIService } from '../services/azure-devops-api.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})

export class ChatbotComponent implements OnInit {
  constructor(private chatbot : ChatbotOpenAIService, private devopsService : AzureDevopsAPIService) { }

  ngOnInit(): void {
  }

  result : string = "";
  query : string  = "";
  results: string[] = [];
  queries: string[] = [];
  response;
  command: { link: string, body: { key: string, value: string }[] };
  commandQuery: string = "";
  

  postCompletion(){

    let myprompt="I am an highly intelligent question-answering bot called Toolit. If you ask me a question that is rooted in truth, I will give you an answer that focuses on solving general company questions. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with \"I do not know.\" Toolit is also integrated with the Azure DevOps and Outlook APIs. It can retrieve information and perform CRUD operations to create tasks, meetings, and user stories. among others\n\nQ:What are the company's policies and procedures regarding time off and vacation requests?\nA:The company's policies and procedures regarding time off and vacation requests are outlined in the employee handbook. Employees must submit a written request to their supervisor at least two weeks before the requested time off. The supervisor will review and approve or deny the request based on the company's policies and procedures.\n\nQ: What resources are available to help me develop my skills and advance my career within the company?\nA: The company offers a variety of resources to help employees develop their skills and advance their careers. These include on-the-job training, mentorship programs, online courses, and professional development seminars. Additionally, the company offers tuition reimbursement for employees who wish to pursue higher education.\n\nQ:Can you explain the company's retirement plan and how I can enroll or change my contributions?\nA: The company offers a 401(k) retirement plan to eligible employees. Employees can enroll in the plan by completing the enrollment form and submitting it to the Human Resources department. Employees can also change their contribution amounts at any time by submitting a new form. The company matches employee contributions up to a certain percentage.\n\nQ:Give me all the work items from my Azure DevOps.\nA:{\"type\": \"POST\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0\", \"body\": [[\"query\",\"SELECT [System.Title] from WorkItems\"]]}\n\nQ:Could you give me the work item with an ID of 12?\nA:{\"type\": \"GET\", \"ContentType\": \"application/json\", \"link\":\n\"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/12?api-version=7.0\", \"body\": []}\n\nQ:Give me the work item from my Azure DevOps project with an ID of 47\nA: {\"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/47?api-version=7.0\", \"body\": []}\n\nQ:Give me a list of all teams from my Azure DevOps organization\nA: {\"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/_apis/teams?api-version=7.0-preview.3\", \"body\": []}\n\nQ:Give me the recent work item activities from my Azure DevOps\nA:{\"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0\", \"ContentType\": \"application/json\", \"body\": []}\n\nQ:Give me all the tasks from my Azure DevOps in a descending  order\nA:{\"type\": \"POST\"\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0\", \"body\": [[\"query\",\"Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] desc\"]]}\n\nQ:Give me all the tasks from my Azure DevOps in an ascending order\nA:{\"type\": \"POST\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0\", \"body\": [[\"query\",\"Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] asc\"]]}\n\nQ:Create a new user story called \"As a user I want to login\"\nA:{\"type\": \"POST\", \"ContentType\": \"application/json-patch+json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/$User Story?api-version=7.0\", \"body\": [[\"op\",\"add\"],[\"path\",\"/fields/System.Title\"],[\"from\",\"null\"],[\"value\",\"As a user I want to login.\"]]}\nQ: " + this.query + "\n";

    //let myprompt = "I am an highly intelligent question-answering bot called Toolit. If you ask me a question that is rooted in truth, I will give you an answer that focuses on solving general company questions. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with \"I do not know.\" Toolit is also integrated with the Azure DevOps and Outlook APIs. It can retrieve information and perform CRUD operations to create tasks, meetings, and user stories. among others \n\nQ:What are the company's policies and procedures regarding time off and vacation requests? \nA:The company's policies and procedures regarding time off and vacation requests are outlined in the employee handbook. Employees must submit a written request to their supervisor at least two weeks before the requested time off. The supervisor will review and approve or deny the request based on the company's policies and procedures.\n\nQ: What resources are available to help me develop my skills and advance my career within the company?\nA: The company offers a variety of resources to help employees develop their skills and advance their careers. These include on-the-job training, mentorship programs, online courses, and professional development seminars. Additionally, the company offers tuition reimbursement for employees who wish to pursue higher education.\n\nQ: Can you explain the company's retirement plan and how I can enroll or change my contributions?\nA: The company offers a 401(k) retirement plan to eligible employees. Employees can enroll in the plan by completing the enrollment form and submitting it to the Human Resources department. Employees can also change their contribution amounts at any time by submitting a new form. The company matches employee contributions up to a certain percentage.\n\nQ: Give me all the work items from my Azure DevOps.\nA: {\"type\": \"POST\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0\", \"body\": [[\"query\",\"SELECT [Id] from WorkItems\"]]}\n\nQ: Could you give me the work item with an ID of 12?\nA: {\"type\": \"GET\", \"link\": \n\"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/12?api-version=7.0\", \"body\": []}\nQ: Give me the work item from my Azure DevOps project with an ID of 47\nA: {\"type\": \"GET\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/47?api-version=7.0\", \"body\": []}\nQ: Give me the work item from my Azure DevOps project with an ID of 131\nA: {\"type\": \"GET\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/131?api-version=7.0\", \"body\": []}\n\nQ: Give me the work item from my Azure DevOps project with an ID of 71\nA: {\"type\": \"GET\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/71?api-version=7.0\", \"body\": []}\n\nQ: Give me a list of all teams from my Azure DevOps organization\nA: {\"type\": \"GET\", \"link\": \"https://dev.azure.com/multiAgentes/_apis/teams?api-version=7.0-preview.3\", \"body\": []}\n\nQ: Give me the recent work item activities from my Azure DevOps\nA: {\"type\": \"GET\", \"link\": \"https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0\", \"body\": []}\n\nQ: Give me all the tasks from my Azure DevOps in a descending  order.\nA: {\"type\": \"POST\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0\", \"body\": [[\"query\",\"Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] desc\"]]}\nQ:Create a new user story called \"As a user I want to login\"\nA: {\"type\": \"POST\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/$User Story?api-version=7.0\", \"body\": [[\"op\",\"add\"],[\"path\",\"/fields/System.Title\"],[\"from\",\"null\"],[\"value\",\"As a user I want to login.\"]]}\nQ: " + this.query;

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

      // Podríamos llamar a processResponse aquí.
      this.processResponse(data);

    });
  }
  
  processResponse(data){

    let parsedResponse;

    this.commandQuery = data.choices[0].text.replace('A:','');
    
    console.log(this.commandQuery);
    
    try {
      var dataResponse;
      parsedResponse = JSON.parse(this.commandQuery);
      const pairs = this.devopsService.obtainPairs(parsedResponse);

      // Hacemos un request
      this.devopsService.makeRequest(parsedResponse.type, parsedResponse.ContentType, parsedResponse.link, pairs).subscribe((data: any) => {
        console.log(data);
        
        // Primero que nada, verificamos si los datos obtenidos contienen un atributo llamado "workItems".
        // Esto para saber si tenemos que obtener los datos de cada ID de los workItems obtenidos por medio
        // de WiQl.
        let stringResult = "";
        if (data.hasOwnProperty("workItems")) {
          console.log("myObject has a 'workItems' attribute");
          
          // Extraemos los IDs de cada work item obtenido
          const workItemIDs: number[] = data.workItems.map((product) => product.id);
          console.log(workItemIDs);

          // Mandamos llamar la función especialmente hecha para obtener los datos
          // de varios work items en bache, tomando en cuenta sus IDs
          this.devopsService.getBatchWorkItems(workItemIDs).subscribe((dataWIB: any) => {
            // Extraer datos de los workItems aquí, para luego convertir todo en strings
            // y después mostrarlo en el chat.
            console.log(dataWIB);

            const resultsBatch = dataWIB.value.map(item => ({
              id: item.id,
              title: item.fields['System.Title'],
              workItemType: item.fields['System.WorkItemType']
            }));
            
            console.log(resultsBatch);

            // Hacer for que recorre los workitems y los almacena en un string bonito :)
            
            // Buscar como insertar html en string y qué otros saltos de línea hay.
            resultsBatch.forEach(function (value) {
              let eachResultString: string;
              eachResultString = 'ID: ' + value.id + ', Title: ' + value.title + ', Work item type: ' + value.workItemType + '\n';

              stringResult = stringResult + eachResultString + '\n';
            });


            console.log(stringResult);
            
            // Insertar en el chat
            this.results.push(stringResult);

          });
          return;    
          
        // AQUÍ PODRÍAMOS AGREGAR MÁS IFs PARA SABER CÓMO PARSEAR LA INFORMACIÓN Y MOSTRARLA EN EL CHAT
        } else if (data.hasOwnProperty("fields")) {

          let stringData = JSON.stringify(data);
          console.log(stringData);
          
          const resultsBatch = {
            id: data.id,
            title: data.fields['System.Title'],
            workItemType: data.fields['System.WorkItemType'],
            createdBy: data.fields['System.CreatedBy'].displayName,
          }

          stringResult = "ID: " + resultsBatch.id + ", Title: " + resultsBatch.title + ", Work item type: " + resultsBatch.workItemType + 
          ", Created By: " + resultsBatch.createdBy;
          
          console.log(stringResult);
          this.results.push(stringResult);

          return;
        }

        
        // Se convierte el objecto obtenido en un JSON
        const stringResponse = JSON.stringify(data);
        console.log(stringResponse);
        
        // Se despliega en el chat el string obtenido
        this.results.push(stringResponse);
      });

    // Si hay un error parseando la respuesta del bot, significa que no regresó un JSON y por lo tanto
    // se imprime directamente en el chat sin procesarla
    } catch (error) {
      console.error(`Error parsing JSON on line '${this.commandQuery}': ${error}`);
      this.results.push(this.commandQuery);
    }
  }
}
