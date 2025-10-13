import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicServiceDetail } from './public-service-detail';

describe('PublicServiceDetail', () => {
  let component: PublicServiceDetail;
  let fixture: ComponentFixture<PublicServiceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicServiceDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicServiceDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
