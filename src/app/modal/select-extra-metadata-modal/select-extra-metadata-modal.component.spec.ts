import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectExtraMetadataModalComponent } from './select-extra-metadata-modal.component';

describe('SelectUniprotModalComponent', () => {
  let component: SelectExtraMetadataModalComponent;
  let fixture: ComponentFixture<SelectExtraMetadataModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectExtraMetadataModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectExtraMetadataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
