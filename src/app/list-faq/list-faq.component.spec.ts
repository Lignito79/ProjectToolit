import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFaqComponent } from './list-faq.component';

describe('ListFaqComponent', () => {
  let component: ListFaqComponent;
  let fixture: ComponentFixture<ListFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFaqComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
