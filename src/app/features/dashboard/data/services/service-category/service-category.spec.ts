import { TestBed } from '@angular/core/testing';

import { ServiceCategoryService } from './service-category.service';

describe('ServiceCategory', () => {
  let service: ServiceCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
