import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ServiceCategoryForm
} from '@features/dashboard/ui/service-category/ui/forms/service-category-form/service-category-form';


describe('ServiceCategoryCreate', () => {
  let component: ServiceCategoryForm;
  let fixture: ComponentFixture<ServiceCategoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceCategoryForm]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ServiceCategoryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
