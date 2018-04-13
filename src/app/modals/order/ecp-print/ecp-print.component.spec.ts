import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcpPrintComponent } from './ecp-print.component';

describe('EcpPrintComponent', () => {
  let component: EcpPrintComponent;
  let fixture: ComponentFixture<EcpPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcpPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcpPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
