import { TestBed, inject } from '@angular/core/testing';

import { SpinnerInterceptor } from './spinner.interceptor';

describe('SpinnerInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpinnerInterceptor]
    });
  });

  it('should be created', inject([SpinnerInterceptor], (service: SpinnerInterceptor) => {
    expect(service).toBeTruthy();
  }));
});
