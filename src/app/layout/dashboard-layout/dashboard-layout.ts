import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { DashboardFooterLayout } from './dashboard-footer-layout/dashboard-footer-layout';
import { DashboardHeaderLayout } from './dashboard-header-layout/dashboard-header-layout';
import { DashboardSidebarLayout } from './dashboard-sidebar-layout/dashboard-sidebar-layout';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    HlmSidebarImports,
    DashboardHeaderLayout,
    DashboardFooterLayout,
    DashboardSidebarLayout,
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayout {}
