import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateItemQtyComponent } from './update-item-qty.component';

describe('UpdateItemQtyComponent', () => {
  let component: UpdateItemQtyComponent;
  let fixture: ComponentFixture<UpdateItemQtyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateItemQtyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateItemQtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
