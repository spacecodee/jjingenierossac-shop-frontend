import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HlmButtonImports],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('jjingenierossac-shop-frontend');
}
