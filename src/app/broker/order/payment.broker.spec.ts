import { TestBed, inject } from '@angular/core/testing';

import { PaymentBroker } from './payment.broker';

describe('PaymentBroker', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentBroker]
    });
  });

  it('should be created', inject([PaymentBroker], (service: PaymentBroker) => {
    expect(service).toBeTruthy();
  }));
});
