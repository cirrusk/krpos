import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupOrderComponent } from './pickup-order.component';

describe('PickupOrderComponent', () => {
  let component: PickupOrderComponent;
  let fixture: ComponentFixture<PickupOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickupOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickupOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
