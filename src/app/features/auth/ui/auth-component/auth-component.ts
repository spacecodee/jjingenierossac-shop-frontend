import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmAspectRatioImports } from '@spartan-ng/helm/aspect-ratio';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-auth-component',
  imports: [RouterOutlet, HlmAspectRatioImports, NgOptimizedImage],
  templateUrl: './auth-component.html',
  styleUrl: './auth-component.css',
})
export class AuthComponent {
  companyName = 'J&J Ingenieros SAC';
  companyDescription =
    'Expertos en equipamiento eléctrico, maquinaria industrial y servicios técnicos especializados en Tumbes, Perú.';
}
