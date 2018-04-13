import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBerComponent } from './search-ber.component';

describe('SearchBerComponent', () => {
  let component: SearchBerComponent;
  let fixture: ComponentFixture<SearchBerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchBerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
