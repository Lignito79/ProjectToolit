import { TestBed } from '@angular/core/testing';

import { ManageFaqService } from './manage-faq.service';

describe('ManageFaqService', () => {
  let service: ManageFaqService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageFaqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
