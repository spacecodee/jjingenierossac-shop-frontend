import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicHeaderLayout } from './public-header-layout';

describe('PublicHeaderLayout', () => {
  let component: PublicHeaderLayout;
  let fixture: ComponentFixture<PublicHeaderLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHeaderLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicHeaderLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
