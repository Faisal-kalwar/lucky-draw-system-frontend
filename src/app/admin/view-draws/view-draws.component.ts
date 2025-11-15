import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { CreateDrawComponent } from '../create-draw/create-draw.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Draw {
  id: number;
  prizeName: string;
  drawDate: string;
  status: string;
  participants: number;
}

@Component({
  selector: 'app-view-draws',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    CardModule,
    CreateDrawComponent,
    HttpClientModule  
  ],
  templateUrl: './view-draws.component.html',
  styleUrls: ['./view-draws.component.scss']
})
export class ViewDrawsComponent implements OnInit {
  draws: Draw[] = [];
  loading: boolean = false;
  showDrawModal: boolean = false;
  selectedDrawId: number | null = null;

  constructor(private router: Router , private http: HttpClient) { }

  ngOnInit() {
    this.loadDraws();
  }

 loadDraws() {
  this.loading = true;
  
  this.http.get<{ data: Draw[] }>('http://localhost:3333/draws').subscribe({
    next: (res) => {
      this.draws = res.data; // assuming your backend returns { data: [...] }
      this.loading = false;
    },
    error: (err) => {
      console.error('Failed to load draws', err);
      this.loading = false;
    }
  });
}


  openCreateDrawModal() {
    this.selectedDrawId = null;
    this.showDrawModal = true;
  }

  openEditDrawModal(drawId: number) {
    this.selectedDrawId = drawId;
    this.showDrawModal = true;
  }

  viewParticipants(draw: Draw) {
    this.router.navigate(['/admin/participants', draw.id]);
  }

  runDraw(draw: Draw) {
    alert(`🎉 Winner selected for: ${draw.prizeName}`);
  }

  onDrawCreated() {
    this.loadDraws(); // Refresh the table
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'completed':
        return 'success';
      case 'upcoming':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}