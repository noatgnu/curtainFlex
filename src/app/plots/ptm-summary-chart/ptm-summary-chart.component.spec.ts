import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtmSummaryChartComponent } from './ptm-summary-chart.component';

describe('PtmSummaryChartComponent', () => {
  let component: PtmSummaryChartComponent;
  let fixture: ComponentFixture<PtmSummaryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtmSummaryChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PtmSummaryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
