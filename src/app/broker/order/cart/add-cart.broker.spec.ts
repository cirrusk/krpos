import { TestBed, inject } from '@angular/core/testing';

import { AddCartBroker } from './add-cart.broker';

describe('AddCartBroker', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddCartBroker]
    });
  });

  it('should be created', inject([AddCartBroker], (service: AddCartBroker) => {
    expect(service).toBeTruthy();
  }));
});
