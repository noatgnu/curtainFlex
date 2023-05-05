import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProteinDomainModalComponent } from './protein-domain-modal.component';

describe('ProteinDomainModalComponent', () => {
  let component: ProteinDomainModalComponent;
  let fixture: ComponentFixture<ProteinDomainModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProteinDomainModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProteinDomainModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
