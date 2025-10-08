import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSidebarLayout } from './dashboard-sidebar-layout';

describe('DashboardSidebarLayout', () => {
  let component: DashboardSidebarLayout;
  let fixture: ComponentFixture<DashboardSidebarLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSidebarLayout]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardSidebarLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
