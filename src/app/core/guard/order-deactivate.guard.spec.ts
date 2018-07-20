import { TestBed, async, inject } from '@angular/core/testing';

import { OrderDeactivateGuard } from './order-deactivate.guard';

describe('OrderDeactivateGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderDeactivateGuard]
    });
  });

  it('should ...', inject([OrderDeactivateGuard], (guard: OrderDeactivateGuard) => {
    expect(guard).toBeTruthy();
  }));
});
