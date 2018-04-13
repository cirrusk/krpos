import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EtcOrderComponent } from './etc-order.component';

describe('EtcOrderComponent', () => {
  let component: EtcOrderComponent;
  let fixture: ComponentFixture<EtcOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtcOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtcOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
