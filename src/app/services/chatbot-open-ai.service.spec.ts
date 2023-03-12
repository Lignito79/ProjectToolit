import { TestBed } from '@angular/core/testing';

import { ChatbotOpenAIService } from './chatbot-open-ai.service';

describe('ChatbotOpenAIService', () => {
  let service: ChatbotOpenAIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatbotOpenAIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
