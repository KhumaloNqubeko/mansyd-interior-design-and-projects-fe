import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  template: `@if (control()?.touched && control()?.invalid) { <span class="field-error" role="alert">{{ message() }}</span> }`
})
export class ValidationMessageComponent {
  readonly control = input.required<AbstractControl | null>();
  readonly label = input.required<string>();
  message(): string {
    const errors = this.control()?.errors;
    if (errors?.['required']) return `${this.label()} is required.`;
    if (errors?.['email']) return 'Enter a valid email address.';
    if (errors?.['minlength']) return `${this.label()} is too short.`;
    if (errors?.['pattern']) return `${this.label()} does not meet the required format.`;
    return `${this.label()} is invalid.`;
  }
}

