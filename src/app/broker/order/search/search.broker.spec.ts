import { TestBed, inject } from '@angular/core/testing';

import { SearchBroker } from './search.broker';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchBroker]
    });
  });

  it('should be created', inject([SearchBroker], (service: SearchBroker) => {
    expect(service).toBeTruthy();
  }));
});
