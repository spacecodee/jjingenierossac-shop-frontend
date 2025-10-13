import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicFooterLayout } from './public-footer-layout';

describe('PublicFooterLayout', () => {
  let component: PublicFooterLayout;
  let fixture: ComponentFixture<PublicFooterLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicFooterLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicFooterLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
