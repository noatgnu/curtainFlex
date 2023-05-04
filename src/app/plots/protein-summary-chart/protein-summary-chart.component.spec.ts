import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProteinSummaryChartComponent } from './protein-summary-chart.component';

describe('BarChartComponent', () => {
  let component: ProteinSummaryChartComponent;
  let fixture: ComponentFixture<ProteinSummaryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProteinSummaryChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProteinSummaryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
