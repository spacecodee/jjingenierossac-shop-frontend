import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-register-form',
  imports: [ReactiveFormsModule, RouterLink, HlmInputImports, HlmButtonImports],
  templateUrl: './register-form-component.html',
  styleUrl: './register-form-component.css',
})
export class RegisterFormComponent {
  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Register form submitted:', this.registerForm.value);
    }
  }
}
