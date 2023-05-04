import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolcanoSelectionModalComponent } from './volcano-selection-modal.component';

describe('VolcanoSelectionModalComponent', () => {
  let component: VolcanoSelectionModalComponent;
  let fixture: ComponentFixture<VolcanoSelectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VolcanoSelectionModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolcanoSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
