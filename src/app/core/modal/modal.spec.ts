import { TestBed, inject } from '@angular/core/testing';

import { Modal } from './modal';

describe('Modal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Modal]
    });
  });

  it('should be created', inject([Modal], (service: Modal) => {
    expect(service).toBeTruthy();
  }));
});
