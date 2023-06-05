import { TestBed } from '@angular/core/testing';

import { ClearChatService } from './clear-chat.service';

describe('ClearChatService', () => {
  let service: ClearChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClearChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
