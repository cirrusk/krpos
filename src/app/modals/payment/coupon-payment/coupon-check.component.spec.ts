import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponCheckComponent } from './coupon-check.component';

describe('CouponCheckComponent', () => {
  let component: CouponCheckComponent;
  let fixture: ComponentFixture<CouponCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
