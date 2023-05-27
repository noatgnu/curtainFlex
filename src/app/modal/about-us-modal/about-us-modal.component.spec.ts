import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsModalComponent } from './about-us-modal.component';

describe('AboutUsModalComponent', () => {
  let component: AboutUsModalComponent;
  let fixture: ComponentFixture<AboutUsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AboutUsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutUsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
