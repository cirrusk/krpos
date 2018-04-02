import { TestBed, inject } from '@angular/core/testing';

import { SearchAccountBroker } from './search-account.broker';

describe('SearchPriceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchAccountBroker]
    });
  });

  it('should be created', inject([SearchAccountBroker], (service: SearchAccountBroker) => {
    expect(service).toBeTruthy();
  }));
});
