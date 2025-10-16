import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoryForm } from './subcategory-form';

describe('SubcategoryForm', () => {
  let component: SubcategoryForm;
  let fixture: ComponentFixture<SubcategoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubcategoryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubcategoryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
