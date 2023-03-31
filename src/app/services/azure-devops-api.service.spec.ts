import { TestBed } from '@angular/core/testing';

import { AzureDevopsAPIService } from './azure-devops-api.service';

describe('AzureDevopsAPIService', () => {
  let service: AzureDevopsAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AzureDevopsAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
