import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideFacebook,
  lucideInstagram,
  lucideLinkedin,
  lucideMail,
  lucidePhone,
} from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmSeparator } from '@spartan-ng/helm/separator';

@Component({
  selector: 'app-public-footer-layout',
  imports: [NgIconComponent, HlmIcon, HlmSeparator, RouterLink],
  providers: [
    provideIcons({
      lucidePhone,
      lucideMail,
      lucideFacebook,
      lucideInstagram,
      lucideLinkedin,
    }),
  ],
  templateUrl: './public-footer-layout.html',
  styleUrl: './public-footer-layout.css',
})
export class PublicFooterLayout {
  readonly currentYear = new Date().getFullYear();
}
