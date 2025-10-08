import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideHeart } from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-dashboard-footer-layout',
  imports: [NgIconComponent, HlmIcon],
  templateUrl: './dashboard-footer-layout.html',
  styleUrl: './dashboard-footer-layout.css',
  providers: [provideIcons({ lucideHeart })],
})
export class DashboardFooterLayout {
}
