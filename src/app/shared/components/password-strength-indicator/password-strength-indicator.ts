import { Component, computed, input } from '@angular/core';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { PasswordRequirements } from './password-requirements.interface';

@Component({
  selector: 'app-password-strength-indicator',
  imports: [HlmProgressImports],
  templateUrl: './password-strength-indicator.html',
  styleUrl: './password-strength-indicator.css',
})
export class PasswordStrengthIndicatorComponent {
  password = input.required<string>();
  showRequirements = input<boolean>(true);

  readonly requirements = computed<PasswordRequirements>(() => {
    const pwd = this.password();

    if (!pwd) {
      return {
        minLength: false,
        upperCase: false,
        lowerCase: false,
        number: false,
        specialChar: false,
      };
    }

    return {
      minLength: pwd.length >= 8,
      upperCase: /[A-Z]/.test(pwd),
      lowerCase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      specialChar: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(pwd),
    };
  });

  readonly strength = computed(() => {
    const reqs = this.requirements();
    const checks = [reqs.minLength, reqs.upperCase, reqs.lowerCase, reqs.number, reqs.specialChar];
    const passed = checks.filter(Boolean).length;
    const percentage = (passed / 5) * 100;

    if (percentage <= 40)
      return { level: 'weak', label: 'Débil', percentage, color: 'destructive' };
    if (percentage <= 80) return { level: 'medium', label: 'Media', percentage, color: 'warning' };
    return { level: 'strong', label: 'Fuerte', percentage, color: 'success' };
  });
}
