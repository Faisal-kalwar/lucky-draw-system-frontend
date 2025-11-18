import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  
  isLoading = false;
  loading = false;
  showForgotPassword = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  errorMessage = '';
  message = '';
  error = '';

  // Main submit handler - routes to correct form
  onSubmit() {
    if (this.showForgotPassword) {
      this.onForgotPasswordSubmit();
    } else {
      this.onLoginSubmit();
    }
  }

  // Handle login form submission
  onLoginSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value as { email: string; password: string };

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        console.log('Logged in as:', res.user);
        this.router.navigate(['/home']);
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

  // Handle forgot password form submission
  onForgotPasswordSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    const { email } = this.forgotForm.value as { email: string };

    this.authService.requestResetPassword(email).subscribe({
      next: (res) => {
        this.message = res.message || 'Reset link sent to your email';
        this.forgotForm.reset();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to send reset link';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Toggle between login and forgot password forms
  toggleForgotPassword() {
    this.showForgotPassword = !this.showForgotPassword;
    this.errorMessage = '';
    this.message = '';
    this.error = '';
    this.loginForm.reset();
    this.forgotForm.reset();
  }
}