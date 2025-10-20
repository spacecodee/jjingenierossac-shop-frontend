import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicProductDetail } from './public-product-detail';

describe('PublicProductDetail', () => {
  let component: PublicProductDetail;
  let fixture: ComponentFixture<PublicProductDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicProductDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicProductDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
