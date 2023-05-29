import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSelectionRemovalModalComponent } from './data-selection-removal-modal.component';

describe('DataSelectionRemovalModalComponent', () => {
  let component: DataSelectionRemovalModalComponent;
  let fixture: ComponentFixture<DataSelectionRemovalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSelectionRemovalModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataSelectionRemovalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
