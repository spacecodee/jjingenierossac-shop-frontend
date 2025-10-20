import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicProductList } from './public-product-list';

describe('PublicProductList', () => {
  let component: PublicProductList;
  let fixture: ComponentFixture<PublicProductList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicProductList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicProductList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
