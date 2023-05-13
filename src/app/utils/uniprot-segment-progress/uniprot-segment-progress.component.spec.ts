import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniprotSegmentProgressComponent } from './uniprot-segment-progress.component';

describe('UniprotSegmentProgressComponent', () => {
  let component: UniprotSegmentProgressComponent;
  let fixture: ComponentFixture<UniprotSegmentProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UniprotSegmentProgressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniprotSegmentProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
