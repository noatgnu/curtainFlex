import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedDataManagementModalComponent } from './imported-data-management-modal.component';

describe('ImportedDataManagementModalComponent', () => {
  let component: ImportedDataManagementModalComponent;
  let fixture: ComponentFixture<ImportedDataManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportedDataManagementModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportedDataManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
