import { TestBed, async, inject } from '@angular/core/testing';

import { NoticeResolver } from './notice.resolver';

describe('NoticeResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NoticeResolver]
    });
  });

  it('should ...', inject([NoticeResolver], (guard: NoticeResolver) => {
    expect(guard).toBeTruthy();
  }));
});
