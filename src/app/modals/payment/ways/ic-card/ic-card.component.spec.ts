import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcCardComponent } from './ic-card.component';

describe('IcCardComponent', () => {
  let component: IcCardComponent;
  let fixture: ComponentFixture<IcCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
