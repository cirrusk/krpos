import { TestBed, inject } from '@angular/core/testing';

import { ReceiptDataProvider } from './receipt-data-provider';

describe('ReceiptDataProviderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReceiptDataProvider]
    });
  });

  it('should be created', inject([ReceiptDataProvider], (service: ReceiptDataProvider) => {
    expect(service).toBeTruthy();
  }));
});
