import { Component } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../../auth.service'

export function passwordMatchValidator() {
  return (control: AbstractControl) => {
    const pass = control.get('password')?.value
    const confirm = control.get('confirmPassword')?.value
    return pass && confirm && pass !== confirm ? { mismatch: true } : null
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
  isLoading = false
  errorMessage: string | null = null

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,}$/)]],
        amount: [null, [Validators.required, Validators.min(100)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        payment_option: ['bank', Validators.required],
      },
      { validators: passwordMatchValidator() }
    )
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched()
      return
    }

    this.isLoading = true
    const { name, email, password, payment_option } = this.registerForm.value

    this.auth.register({ full_name: name, email, password, payment_option })
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
  }
}
