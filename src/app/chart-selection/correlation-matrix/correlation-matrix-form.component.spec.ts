import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrelationMatrixFormComponent } from './correlation-matrix-form.component';

describe('HeatmapFormComponent', () => {
  let component: CorrelationMatrixFormComponent;
  let fixture: ComponentFixture<CorrelationMatrixFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrelationMatrixFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrelationMatrixFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
