import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolcanoPlotFormComponent } from './volcano-plot-form.component';

describe('VolcanoPlotComponent', () => {
  let component: VolcanoPlotFormComponent;
  let fixture: ComponentFixture<VolcanoPlotFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VolcanoPlotFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolcanoPlotFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
