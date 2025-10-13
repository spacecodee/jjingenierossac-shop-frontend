import { TestBed } from '@angular/core/testing';

import { PublicServiceApi } from './public-service-api';

describe('PublicServiceApi', () => {
  let service: PublicServiceApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicServiceApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
