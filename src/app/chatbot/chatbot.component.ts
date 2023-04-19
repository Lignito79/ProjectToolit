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
  command: { link: string, body: { key: string, value: string }[] };
  commandQuery: string = "";
  

  postCompletion(){

    let myprompt="I am an highly intelligent question-answering bot called Toolit. If you ask me a question that is rooted in truth, I will give you an answer that focuses on solving general company questions. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with \"I do not know.\" Toolit is also integrated with the Azure DevOps and Outlook APIs. It can retrieve information and perform CRUD operations to create tasks, meetings, and user stories. among others\n\nQ:What are the company's policies and procedures regarding time off and vacation requests?\nA:The company's policies and procedures regarding time off and vacation requests are outlined in the employee handbook. Employees must submit a written request to their supervisor at least two weeks before the requested time off. The supervisor will review and approve or deny the request based on the company's policies and procedures.\n\nQ: What resources are available to help me develop my skills and advance my career within the company?\nA: The company offers a variety of resources to help employees develop their skills and advance their careers. These include on-the-job training, mentorship programs, online courses, and professional development seminars. Additionally, the company offers tuition reimbursement for employees who wish to pursue higher education.\n\nQ:Can you explain the company's retirement plan and how I can enroll or change my contributions?\nA: The company offers a 401(k) retirement plan to eligible employees. Employees can enroll in the plan by completing the enrollment form and submitting it to the Human Resources department. Employees can also change their contribution amounts at any time by submitting a new form. The company matches employee contributions up to a certain percentage.\n\nQ:Give me all the work items from my Azure DevOps.\nA:{\"type\": \"POST\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=6.0\", \"body\": [[\"query\",\"SELECT [Id] from WorkItems\"]]}\n\nQ:Could you give me the work item with an ID of 12?\nA:{\"type\": \"GET\", \"ContentType\": \"application/json\", \"link\":\n\"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/12?api-version=7.0\", \"body\": []}\n\nQ:Give me the work item from my Azure DevOps project with an ID of 47\nA: {\"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/47?api-version=7.0\", \"body\": []}\n\nQ:Give me a list of all teams from my Azure DevOps organization\nA: {\"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/_apis/teams?api-version=7.0-preview.3\", \"body\": []}\n\nQ:Give me the recent work item activities from my Azure DevOps\nA:{\"type\": \"GET\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/_apis/work/accountmyworkrecentactivity?api-version=7.0\", \"ContentType\": \"application/json\", \"body\": []}\n\nQ:Give me all the tasks from my Azure DevOps in a descending  order\nA:{\"type\": \"POST\"\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0\", \"body\": [[\"query\",\"Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] desc\"]]}\n\nQ:Give me all the tasks from my Azure DevOps in an ascending order\nA:{\"type\": \"POST\", \"ContentType\": \"application/json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/wiql?api-version=7.0\", \"body\": [[\"query\",\"Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'Task' order by [System.CreatedDate] asc\"]]}\n\nQ:Create a new user story called \"As a user I want to login\"\nA:{\"type\": \"POST\", \"ContentType\": \"application/json-patch+json\", \"link\": \"https://dev.azure.com/multiAgentes/MultiAgentesTC3004B.103/_apis/wit/workitems/$User Story?api-version=7.0\", \"body\": [[\"op\",\"add\"],[\"path\",\"/fields/System.Title\"],[\"from\",\"null\"],[\"value\",\"As a user I want to login.\"]]}\nQ: " + this.query + "\n";


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

    this.chatbot.postCompletion(payload).subscribe((data: any) => {
	    
      this.results.push(data.choices[0].text)
      this.queries.push(this.query)

      this.commandQuery = data.choices[0].text.replace('A:','')

      console.log(this.commandQuery);

    });
  }

  getWorkItems(){
    this.devopsService.getWorkItems().subscribe((data: any) => {
	    console.log(data);
    });
  }

  parseJson(){
    this.command = this.devopsService.parseJson(this.commandQuery);
  }

}
