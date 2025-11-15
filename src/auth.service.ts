import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:3333'
  private currentUserSubject = new BehaviorSubject<any>(this.loadUserFromStorage())
  currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) {}

  // 👉 Register
  register(data: { full_name: string; email: string; password: string ,  paymentOption: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data)
  }

  // 👉 Login
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        this.setSession(res.data.user, res.data.token)
      })
    )
  }

  // 👉 Set token & user
  private setSession(user: any, token: string) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    this.currentUserSubject.next(user)
  }

  // 👉 Logout
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    this.currentUserSubject.next(null)
  }

  // 👉 Auto-load user if present
  private loadUserFromStorage(): any {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  // 👉 Getter for current user
  getCurrentUser(): any {
    return this.currentUserSubject.value
  }

  // 👉 Logged in check
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

  // 👉 Admin role check
  get isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin'
  }

  // 👉 Optional: me() from server to verify token
  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user))
        this.currentUserSubject.next(user)
      })
    )
  }
}
