import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ Required imports
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
   stats = {
    totalDraws: 0,
    totalUsers: 0,
    totalParticipations: 0,
    totalWinners: 0
  }
  constructor(private http: HttpClient) {}


   ngOnInit() {
    this.http.get<any>('http://127.0.0.1:3333/admin/stats').subscribe({
      next: (res) => {
        this.stats = res.data
      },
      error: () => {
        alert('Failed to load dashboard stats')
      }
    })
  }
}
