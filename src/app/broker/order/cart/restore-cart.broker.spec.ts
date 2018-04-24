import { TestBed, inject } from '@angular/core/testing';

import { RestoreCartBroker } from './restore-cart.broker';

describe('RestoreCartBroker', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RestoreCartBroker]
    });
  });

  it('should be created', inject([RestoreCartBroker], (service: RestoreCartBroker) => {
    expect(service).toBeTruthy();
  }));
});
