import { TestBed } from '@angular/core/testing';

import { BatchSearchService } from './batch-search.service';

describe('BatchSearchService', () => {
  let service: BatchSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
