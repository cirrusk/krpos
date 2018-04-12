import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalPaymentComponent } from './normal-payment.component';

describe('NormalPaymentComponent', () => {
  let component: NormalPaymentComponent;
  let fixture: ComponentFixture<NormalPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NormalPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
