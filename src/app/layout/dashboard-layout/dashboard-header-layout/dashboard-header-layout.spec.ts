import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardHeaderLayout } from './dashboard-header-layout';

describe('DashboardHeaderLayout', () => {
  let component: DashboardHeaderLayout;
  let fixture: ComponentFixture<DashboardHeaderLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHeaderLayout]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardHeaderLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
