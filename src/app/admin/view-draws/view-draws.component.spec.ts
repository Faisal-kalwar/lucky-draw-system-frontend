import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDrawsComponent } from './view-draws.component';

describe('ViewDrawsComponent', () => {
  let component: ViewDrawsComponent;
  let fixture: ComponentFixture<ViewDrawsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDrawsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDrawsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
