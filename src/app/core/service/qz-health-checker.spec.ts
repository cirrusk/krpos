import { TestBed, inject } from '@angular/core/testing';

import { QzHealthChecker } from './qz-health-checker';

describe('QzHealthCheckerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QzHealthChecker]
    });
  });

  it('should be created', inject([QzHealthChecker], (service: QzHealthChecker) => {
    expect(service).toBeTruthy();
  }));
});
