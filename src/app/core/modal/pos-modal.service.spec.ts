import { TestBed, inject } from '@angular/core/testing';

import { PosModalService } from './pos-modal.service';

describe('PosModalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PosModalService]
    });
  });

  it('should be created', inject([PosModalService], (service: PosModalService) => {
    expect(service).toBeTruthy();
  }));
});
