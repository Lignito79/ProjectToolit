import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFaqComponent } from './edit-faq.component';

describe('EditFaqComponent', () => {
  let component: EditFaqComponent;
  let fixture: ComponentFixture<EditFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFaqComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
