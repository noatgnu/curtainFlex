import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartFormComponent } from './bar-chart-form.component';

describe('BarChartFormComponent', () => {
  let component: BarChartFormComponent;
  let fixture: ComponentFixture<BarChartFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarChartFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarChartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
