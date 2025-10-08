import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, RouterLink, HlmInputImports, HlmButtonImports, HlmLabelImports],
  templateUrl: './login-form-component.html',
  styleUrl: './login-form-component.css',
})
export class LoginFormComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login form submitted:', this.loginForm.value);
    }
  }
}
