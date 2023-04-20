import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxPlotFormComponent } from './box-plot-form.component';

describe('BoxPlotFormComponent', () => {
  let component: BoxPlotFormComponent;
  let fixture: ComponentFixture<BoxPlotFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoxPlotFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxPlotFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
