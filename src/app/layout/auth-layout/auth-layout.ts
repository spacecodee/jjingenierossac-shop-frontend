import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterLayout } from './footer-layout/footer-layout';
import { HeaderLayout } from './header-layout/header-layout';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, HeaderLayout, FooterLayout],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
}
