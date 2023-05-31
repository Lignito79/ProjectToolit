import { Component } from '@angular/core';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-list-faq',
  templateUrl: './list-faq.component.html',
  styleUrls: ['./list-faq.component.css']
})
export class ListFaqComponent {

  constructor(public chatComponent: ChatbotComponent){ }

  faq = [];

  ngOnInit() {
    this.faq = this.chatComponent.frequentQuestions;
    console.log(this.faq)
  }


}
