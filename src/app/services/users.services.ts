import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  payment_option?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  pending: number;
  rejected: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:3333/api';

  constructor(private http: HttpClient) {}

  /**
   * Get authorization headers with token
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get all users
   */
  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(
      `${this.apiUrl}/users`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get single user by ID
   */
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(
      `${this.apiUrl}/users/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Update user
   */
  updateUser(id: number, data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/users/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiUrl}/users/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Approve user (change status to active)
   */
  approveUser(id: number): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.apiUrl}/users/${id}/approve`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Reject user
   */
  rejectUser(id: number): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.apiUrl}/users/${id}/reject`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get user statistics
   */
  getUserStatistics(): Observable<ApiResponse<UserStatistics>> {
    return this.http.get<ApiResponse<UserStatistics>>(
      `${this.apiUrl}/users/statistics`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get users by status
   */
  getUsersByStatus(status: string): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(
      `${this.apiUrl}/users?status=${status}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(
      `${this.apiUrl}/users?role=${role}`,
      { headers: this.getHeaders() }
    );
  }
}