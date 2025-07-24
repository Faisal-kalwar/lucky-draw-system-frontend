import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDrawComponent } from './create-draw.component';

describe('CreateDrawComponent', () => {
  let component: CreateDrawComponent;
  let fixture: ComponentFixture<CreateDrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDrawComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
