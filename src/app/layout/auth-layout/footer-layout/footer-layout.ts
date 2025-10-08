import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideHeart } from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-footer-layout',
  imports: [NgIconComponent, HlmIcon],
  templateUrl: './footer-layout.html',
  styleUrl: './footer-layout.css',
  providers: [provideIcons({ lucideHeart })],
})
export class FooterLayout {
}
