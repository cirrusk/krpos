import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponPaymentComponent } from './coupon-payment.component';

describe('CouponPaymentComponent', () => {
  let component: CouponPaymentComponent;
  let fixture: ComponentFixture<CouponPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
