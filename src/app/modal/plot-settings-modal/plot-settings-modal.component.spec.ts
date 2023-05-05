import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotSettingsModalComponent } from './plot-settings-modal.component';

describe('PlotSettingsModalComponent', () => {
  let component: PlotSettingsModalComponent;
  let fixture: ComponentFixture<PlotSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlotSettingsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlotSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
