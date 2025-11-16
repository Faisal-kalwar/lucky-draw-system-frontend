import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ChartModule, ButtonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalDraws: 0,
    totalUsers: 0,
    totalParticipations: 0,
    totalWinners: 0
  };

  // Dummy chart data
  participationChartData: any;
  drawsChartData: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Fetch real stats from API
    this.http.get<any>('http://127.0.0.1:3333/admin/stats').subscribe({
      next: (res) => { 
        if(res.data) this.stats = res.data;
      },
      error: () => { alert('Failed to load dashboard stats') }
    });

    // Dummy chart data
    this.participationChartData = {
      labels: ['Draw 1', 'Draw 2', 'Draw 3', 'Draw 4'],
      datasets: [
        {
          label: 'Participants',
          data: [12, 19, 7, 10],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
          borderRadius: 5
        }
      ]
    };

    this.drawsChartData = {
      labels: ['Completed', 'Upcoming', 'Cancelled'],
      datasets: [
        {
          data: [5, 4, 3],
          backgroundColor: ['#42A5F5', '#FFA726', '#EF5350']
        }
      ]
    };
  }
}
