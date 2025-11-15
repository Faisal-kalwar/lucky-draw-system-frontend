import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../../auth.service'

export function passwordMatchValidator() {
  return (formGroup: AbstractControl) => {
    const password = formGroup.get('password')
    const confirmPassword = formGroup.get('confirmPassword')

    if (!password || !confirmPassword) return null
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    } else {
      const errors = confirmPassword.errors
      if (errors && errors['passwordMismatch']) {
        delete errors['passwordMismatch']
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null)
      }
      return null
    }
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup
  errorMessage: string | null = null
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        paymentOption: ['bank', Validators.required],
      },
      { validators: passwordMatchValidator() }
    )
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true
      const { name, email, password, paymentOption } = this.registerForm.value

      this.authService
        .register({ full_name: name, email, password, paymentOption })
        .subscribe({
          next: () => {
            this.isLoading = false
            this.router.navigate(['/pending-verification'])
          },
          error: (err) => {
            this.isLoading = false
            this.errorMessage = err?.error?.message || 'Registration failed'
          },
        })
    } else {
      Object.values(this.registerForm.controls).forEach((control) =>
        control.markAsTouched()
      )
    }
  }
}
