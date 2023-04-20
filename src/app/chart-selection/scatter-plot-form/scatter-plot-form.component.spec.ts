import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterPlotFormComponent } from './scatter-plot-form.component';

describe('ScatterPlotFormComponent', () => {
  let component: ScatterPlotFormComponent;
  let fixture: ComponentFixture<ScatterPlotFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScatterPlotFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScatterPlotFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
