import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelCartComponent } from './cancel-cart.component';

describe('CancelCartComponent', () => {
  let component: CancelCartComponent;
  let fixture: ComponentFixture<CancelCartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelCartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
