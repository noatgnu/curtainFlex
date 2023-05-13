import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtmSummaryChartFormComponent } from './ptm-summary-chart-form.component';

describe('PtmSummaryChartFormComponent', () => {
  let component: PtmSummaryChartFormComponent;
  let fixture: ComponentFixture<PtmSummaryChartFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtmSummaryChartFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PtmSummaryChartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
