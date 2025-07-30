import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCourses } from './add-courses';

describe('AddCourses', () => {
  let component: AddCourses;
  let fixture: ComponentFixture<AddCourses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCourses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCourses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
