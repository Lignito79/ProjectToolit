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

  postCompletion(){

    let myprompt = this.query;

    var payload = { 
      model: "text-davinci-003", 
      prompt: myprompt, 
      temperature: 0.6 
    }

    this.chatbot.postCompletion(payload).subscribe((data: any) => {
	    console.log(data);
      this.results.push(data.choices[0].text)
      this.queries.push(this.query)
    });
  }

  getWorkItems(){
    this.devopsService.getWorkItems().subscribe((data: any) => {
	    console.log(data);
    });
  }

}
