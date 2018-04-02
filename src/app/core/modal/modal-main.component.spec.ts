import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMainComponent } from './modal-main.component';

describe('ModalMainComponent', () => {
  let component: ModalMainComponent;
  let fixture: ComponentFixture<ModalMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
