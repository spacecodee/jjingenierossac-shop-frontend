import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicServiceList } from './public-service-list';

describe('PublicServiceList', () => {
  let component: PublicServiceList;
  let fixture: ComponentFixture<PublicServiceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicServiceList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicServiceList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
