import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface User {
  fullName: string;
  email: string;
}

interface Participant {
  id: number;
  user: User;
  phoneNumber: string;
  accountNumber: string;
  bankName: string;
  referenceNumber: string;
  participationNotes: string | null;
  isWinner: boolean | null;
  createdAt: string;
}

interface Draw {
  id: number;
  prizeName: string;
  description: string;
  drawDate: string;
  maxParticipants: number;
  status: string;
}

@Component({
  selector: 'app-participations',
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
    DialogModule,
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './participations.component.html',
  styleUrls: ['./participations.component.scss']
})
export class ParticipationsComponent implements OnInit {
  participants: Participant[] = [];
  draw: Draw | null = null;
  loading: boolean = false;
  drawId: number = 0;
  
  showAddModal: boolean = false;
  newEmail: string = '';
  addingParticipant: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.drawId = +params['id'];
      if (this.drawId) {
        this.loadData();
      }
    });
  }

  loadData() {
    this.loading = true;
    
    this.http.get<{ success: boolean; data: Participant[] }>(
      `http://localhost:3333/admin/draws/${this.drawId}/participants`
    ).subscribe({
      next: (res) => {
        this.participants = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load participants', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load participants'
        });
        this.loading = false;
      }
    });

    this.http.get<{ success: boolean; data: Draw }>(
      `http://localhost:3333/draws/${this.drawId}`
    ).subscribe({
      next: (res) => {
        this.draw = res.data;
      },
      error: (err) => {
        console.error('Failed to load draw details', err);
      }
    });
  }

  openAddModal() {
    this.showAddModal = true;
    this.newEmail = '';
  }

  addParticipantByEmail() {
    if (!this.newEmail.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter an email address'
      });
      return;
    }

    this.addingParticipant = true;

    this.http.post<{ success: boolean; message: string; data: Participant }>(
      `http://localhost:3333/admin/draws/${this.drawId}/add-participant-by-email`,
      { email: this.newEmail }
    ).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message
        });
        this.showAddModal = false;
        this.newEmail = '';
        this.loadData();
        this.addingParticipant = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to add participant'
        });
        this.addingParticipant = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/draws']);
  }

formatDate(date: any): string {
  if (!date) return 'N/A';

  const d = new Date(date);

  if (isNaN(d.getTime())) return 'N/A';

  return d.toLocaleString();
}

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}