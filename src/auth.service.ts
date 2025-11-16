import { Injectable, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:3333'
  private platformId = inject(PLATFORM_ID)
  private currentUserSubject = new BehaviorSubject<any>(this.loadUserFromStorage())
  currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) { }

  // 👉 Register
  register(data: { full_name: string; email: string; password: string; }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data)
  }

  // 👉 Login
// login(data: { email: string; password: string }): Observable<any> {
//   return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
//     tap((res) => {
//       const token = typeof res.token === 'string'
//         ? res.token
//         : res.token?.token; // if backend returns token obj

//       if (!token) {
//         throw new Error('Invalid token format');
//       }

//       this.setSession(res.user, token);
//     })
//   );
// }
// 👉 Login - SIMPLIFIED VERSION
login(data: { email: string; password: string }): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
    tap((res) => {
      console.log('📦 Full login response:', res);
      console.log('🔑 Token value:', res.token);
      console.log('🔑 Token type:', typeof res.token);
      
      // Backend returns { user, token: "oat_xxx..." }
      const token = res.token;
      
      if (!token || typeof token !== 'string') {
        console.error('❌ Invalid token format:', token);
        throw new Error('Invalid token format received from server');
      }

      // Store token and user
      this.setSession(res.user, token);
      
      // Verify storage immediately
      console.log('✅ Token stored:', localStorage.getItem('token'));
    })
  );
}





  // 👉 Set token & user (BROWSER ONLY)
  private setSession(user: any, token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      this.currentUserSubject.next(user)
    }
  }

  // 👉 Logout (BROWSER ONLY)
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.currentUserSubject.next(null)
    }
  }

  // 👉 Auto-load user if present (FIXED FOR SSR)
  private loadUserFromStorage(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  }

  // 👉 Getter for current user
  getCurrentUser(): any {
    return this.currentUserSubject.value
  }

  // 👉 Logged in check (BROWSER ONLY)
  get isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token')
    }
    return false
  }

  // 👉 Admin role check
  get isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin'
  }

  // 👉 Optional: me() from server to verify token
  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user', JSON.stringify(user))
          this.currentUserSubject.next(user)
        }
      })
    )
  }

  // 👉 Helper: Get token safely
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token')
    }
    return null
  }
}