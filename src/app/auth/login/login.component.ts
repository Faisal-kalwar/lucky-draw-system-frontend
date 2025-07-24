import { Component, inject } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  fb = inject(FormBuilder)
  http = inject(HttpClient)
  router = inject(Router)
  isLoading = false

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })

  errorMessage = ''

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.http.post<any>('http://localhost:3333/login', { email, password }).subscribe({
      next: (res) => {
        const user = res.data.user;

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['home']);
        }
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