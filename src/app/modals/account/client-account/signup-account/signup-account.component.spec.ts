import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupAccountComponent } from './signup-account.component';

describe('SignupAccountComponent', () => {
  let component: SignupAccountComponent;
  let fixture: ComponentFixture<SignupAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
