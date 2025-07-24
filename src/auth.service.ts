import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:3333'
  private currentUserSubject = new BehaviorSubject<any>(null)

  constructor(private http: HttpClient) {}

  register(data: { full_name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data)
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((response: any) => {
        this.currentUserSubject.next(response.user) // set user after login
      })
    )
  }

  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap((user) => this.currentUserSubject.next(user))
    )
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value
  }
}
