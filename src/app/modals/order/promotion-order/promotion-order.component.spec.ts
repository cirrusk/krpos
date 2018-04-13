import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionOrderComponent } from './promotion-order.component';

describe('PromotionOrderComponent', () => {
  let component: PromotionOrderComponent;
  let fixture: ComponentFixture<PromotionOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromotionOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
