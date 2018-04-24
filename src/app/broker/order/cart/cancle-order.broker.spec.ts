import { TestBed, inject } from '@angular/core/testing';

import { CancleOrderBroker } from './cancle-order.broker';

describe('CancleOrderBroker', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CancleOrderBroker]
    });
  });

  it('should be created', inject([CancleOrderBroker], (service: CancleOrderBroker) => {
    expect(service).toBeTruthy();
  }));
});
