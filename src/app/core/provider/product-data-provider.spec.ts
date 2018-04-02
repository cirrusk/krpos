import { TestBed, inject } from '@angular/core/testing';

import { ProductDataProvider } from './product-data-provider';

describe('ProductDataProviderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductDataProvider]
    });
  });

  it('should be created', inject([ProductDataProvider], (service: ProductDataProvider) => {
    expect(service).toBeTruthy();
  }));
});
