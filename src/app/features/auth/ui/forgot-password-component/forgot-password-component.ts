import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, HlmInputImports, HlmButtonImports, HlmLabelImports],
  templateUrl: './forgot-password-component.html',
  styleUrl: './forgot-password-component.css',
})
export class ForgotPasswordComponent {
  forgotPasswordForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      console.log('Forgot password form submitted:', this.forgotPasswordForm.value);
    }
  }
}
