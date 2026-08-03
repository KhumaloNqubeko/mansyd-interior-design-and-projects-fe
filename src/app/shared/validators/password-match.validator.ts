import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.get('password')?.value === control.get('confirmPassword')?.value ? null : { passwordMismatch: true };

