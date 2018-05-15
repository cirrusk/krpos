import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcpConfirmComponent } from './ecp-confirm.component';

describe('EcpConfirmComponent', () => {
  let component: EcpConfirmComponent;
  let fixture: ComponentFixture<EcpConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcpConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcpConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
