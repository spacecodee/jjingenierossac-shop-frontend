import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCategoryCreate } from './service-category-create';

describe('ServiceCategoryCreate', () => {
  let component: ServiceCategoryCreate;
  let fixture: ComponentFixture<ServiceCategoryCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceCategoryCreate]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ServiceCategoryCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
