import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickObserverComponent } from './click-observer.component';

describe('ClickObserverComponent', () => {
  let component: ClickObserverComponent;
  let fixture: ComponentFixture<ClickObserverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClickObserverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClickObserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
