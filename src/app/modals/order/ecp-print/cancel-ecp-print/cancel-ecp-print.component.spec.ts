import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelEcpPrintComponent } from './cancel-ecp-print.component';

describe('CancelEcpPrintComponent', () => {
  let component: CancelEcpPrintComponent;
  let fixture: ComponentFixture<CancelEcpPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelEcpPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelEcpPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
