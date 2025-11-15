import { Component, inject } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../../auth.service' // ✅ Fix the import (AuthService, not authService)

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  fb = inject(FormBuilder)
  router = inject(Router)
  authService = inject(AuthService) // ✅ Inject AuthService
  isLoading = false
  email: any

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })

  errorMessage = ''

  onSubmit() {
    if (this.loginForm.invalid) return

    this.isLoading = true
    this.errorMessage = ''

    const { email, password } = this.loginForm.value as { email: string; password: string };

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        // token and user are already saved
        console.log('Logged in as:', res.user);
        this.router.navigate(['/home']); // navigate after login
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
