import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosReceiptPrintComponent } from './pos-receipt-print.component';

describe('PosReceiptPrintComponent', () => {
  let component: PosReceiptPrintComponent;
  let fixture: ComponentFixture<PosReceiptPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosReceiptPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosReceiptPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
