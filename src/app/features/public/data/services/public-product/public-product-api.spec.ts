import { TestBed } from '@angular/core/testing';

import { PublicProductApi } from './public-product-api';

describe('PublicProductApi', () => {
  let service: PublicProductApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicProductApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
