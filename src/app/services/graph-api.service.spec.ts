import { TestBed } from '@angular/core/testing';

import { GraphApiService } from './graph-api.service';

describe('GraphApiService', () => {
  let service: GraphApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
