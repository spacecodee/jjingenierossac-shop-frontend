import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmAspectRatioImports } from '@spartan-ng/helm/aspect-ratio';
import { CompanyLogoComponent } from '@shared/components/company-logo-component/company-logo-component';

@Component({
  selector: 'app-auth-component',
  imports: [RouterOutlet, HlmAspectRatioImports, NgOptimizedImage, CompanyLogoComponent],
  templateUrl: './auth-component.html',
  styleUrl: './auth-component.css',
})
export class AuthComponent {
  companyDescription =
    'Expertos en equipamiento eléctrico, maquinaria industrial y servicios técnicos especializados en Tumbes, Perú.';
}
