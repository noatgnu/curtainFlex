import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdbViewerModalComponent } from './pdb-viewer-modal.component';

describe('PdbViewerModalComponent', () => {
  let component: PdbViewerModalComponent;
  let fixture: ComponentFixture<PdbViewerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdbViewerModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdbViewerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
