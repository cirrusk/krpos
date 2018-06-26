import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentPlanComponent } from './installment-plan.component';

describe('InstallmentPlanComponent', () => {
  let component: InstallmentPlanComponent;
  let fixture: ComponentFixture<InstallmentPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstallmentPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallmentPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
