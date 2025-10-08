import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFooterLayout } from './dashboard-footer-layout';

describe('DashboardFooterLayout', () => {
  let component: DashboardFooterLayout;
  let fixture: ComponentFixture<DashboardFooterLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFooterLayout]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardFooterLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
