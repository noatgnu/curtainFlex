import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringdbInteractiveComponent } from './stringdb-interactive.component';

describe('StringdbInteractiveComponent', () => {
  let component: StringdbInteractiveComponent;
  let fixture: ComponentFixture<StringdbInteractiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StringdbInteractiveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StringdbInteractiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
