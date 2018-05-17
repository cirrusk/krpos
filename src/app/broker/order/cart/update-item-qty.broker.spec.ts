import { TestBed, inject } from '@angular/core/testing';

import { UpdateItemQtyBroker } from './update-item-qty.broker';

describe('UpdateItemQtyBroker', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateItemQtyBroker]
    });
  });

  it('should be created', inject([UpdateItemQtyBroker], (service: UpdateItemQtyBroker) => {
    expect(service).toBeTruthy();
  }));
});
