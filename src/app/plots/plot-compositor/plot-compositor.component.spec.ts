import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotCompositorComponent } from './plot-compositor.component';

describe('PlotCompositorComponent', () => {
  let component: PlotCompositorComponent;
  let fixture: ComponentFixture<PlotCompositorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlotCompositorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlotCompositorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
