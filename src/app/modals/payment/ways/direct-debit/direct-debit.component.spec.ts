import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectDebitComponent } from './direct-debit.component';

describe('DirectDebitComponent', () => {
  let component: DirectDebitComponent;
  let fixture: ComponentFixture<DirectDebitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectDebitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectDebitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
