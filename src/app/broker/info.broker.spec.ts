import { TestBed, inject } from '@angular/core/testing';

import { InfoBroker } from './info.broker';

describe('InfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InfoBroker]
    });
  });

  it('should be created', inject([InfoBroker], (service: InfoBroker) => {
    expect(service).toBeTruthy();
  }));
});
