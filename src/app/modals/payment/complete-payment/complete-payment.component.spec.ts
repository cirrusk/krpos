import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletePaymentComponent } from './complete-payment.component';

describe('CompletePaymentComponent', () => {
  let component: CompletePaymentComponent;
  let fixture: ComponentFixture<CompletePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompletePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
