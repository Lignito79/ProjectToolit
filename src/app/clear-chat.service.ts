import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription'; 

@Injectable({
  providedIn: 'root'
})
export class ClearChatService {

  invokeClearChat = new EventEmitter();
  subsVar: Subscription;

  constructor() { }

  onClearChat() {
    this.invokeClearChat.emit();
  }


}
