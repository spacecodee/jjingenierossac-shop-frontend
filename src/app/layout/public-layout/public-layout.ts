import { Component } from '@angular/core';
import { PublicFooterLayout } from '@app/layout/public-layout/public-footer-layout/public-footer-layout';
import { PublicHeaderLayout } from '@app/layout/public-layout/public-header-layout/public-header-layout';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [
    PublicFooterLayout,
    PublicHeaderLayout,
    RouterOutlet
  ],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export class PublicLayout {

}
