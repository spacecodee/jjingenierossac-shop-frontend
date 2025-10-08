import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

@Component({
  selector: 'app-dashboard-overview-component',
  imports: [HlmCardImports, HlmTypographyImports],
  templateUrl: './dashboard-overview-component.html',
  styleUrl: './dashboard-overview-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewComponent {
}
