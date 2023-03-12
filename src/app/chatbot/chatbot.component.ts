import { Component, OnInit } from '@angular/core';
import { ChatbotOpenAIService } from '../services/chatbot-open-ai.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {

  constructor(private chatbot : ChatbotOpenAIService) { }

  ngOnInit(): void {
  }

  result :string = "";
  pet : string  = "";

  postCompletition(){

    let myprompt = this.pet;

  var payload = { 
    model: "text-davinci-003", 
    prompt: myprompt, 
    temperature: 0.6 
  }

    this.chatbot.postCompletion(payload)
    .subscribe((data: any) => {
	    //alert(JSON.stringify(data));
	console.log(data);
        this.result = data.choices[0].text;

   });

  }
}
