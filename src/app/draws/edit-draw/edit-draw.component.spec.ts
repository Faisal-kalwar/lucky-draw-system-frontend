import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDrawComponent } from './edit-draw.component';

describe('EditDrawComponent', () => {
  let component: EditDrawComponent;
  let fixture: ComponentFixture<EditDrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDrawComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
