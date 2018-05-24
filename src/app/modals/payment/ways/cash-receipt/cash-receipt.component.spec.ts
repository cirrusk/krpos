import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashReceiptComponent } from './cash-receipt.component';

describe('CashReceiptComponent', () => {
  let component: CashReceiptComponent;
  let fixture: ComponentFixture<CashReceiptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashReceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
