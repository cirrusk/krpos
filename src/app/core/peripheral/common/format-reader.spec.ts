import { TestBed, inject } from '@angular/core/testing';

import { FormatReader } from './format-reader';

describe('FormatReader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormatReader]
    });
  });

  it('should be created', inject([FormatReader], (service: FormatReader) => {
    expect(service).toBeTruthy();
  }));
});
