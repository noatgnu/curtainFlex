import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDeckComponent } from './chart-deck.component';

describe('BarChartDeckComponent', () => {
  let component: ChartDeckComponent;
  let fixture: ComponentFixture<ChartDeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartDeckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
