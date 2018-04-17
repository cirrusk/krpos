import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReCashComponent } from './re-cash.component';

describe('ReCashComponent', () => {
  let component: ReCashComponent;
  let fixture: ComponentFixture<ReCashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReCashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
