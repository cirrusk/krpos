import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosModalComponent } from './pos-modal.component';

describe('PosModalComponent', () => {
  let component: PosModalComponent;
  let fixture: ComponentFixture<PosModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
