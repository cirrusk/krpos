import { TestBed, inject } from '@angular/core/testing';

import { Config } from './config';

describe('Config', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Config]
    });
  });

  it('should be created', inject([Config], (service: Config) => {
    expect(service).toBeTruthy();
  }));
});
