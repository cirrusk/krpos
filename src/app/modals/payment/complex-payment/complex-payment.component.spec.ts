import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexPaymentComponent } from './complex-payment.component';

describe('ComplexPaymentComponent', () => {
  let component: ComplexPaymentComponent;
  let fixture: ComponentFixture<ComplexPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplexPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplexPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
