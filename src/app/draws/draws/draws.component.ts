import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { JoinDrawModalComponent } from '../join-draw/join-draw.component';
import { Table } from 'primeng/table';


interface Draw {
  id: number;
  prizeName: string;
  description: string;
  drawDate: string;
  status: string;
  maxParticipants?: number;
  participantCount?: number;
}

interface Participation {
  id: number;
  userId: number;
  drawId: number;
  isWinner?: boolean;
}

@Component({
  selector: 'app-draws',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule,
    JoinDrawModalComponent
  ],
  providers: [MessageService],
  templateUrl: './draws.component.html',
  styleUrls: ['./draws.component.scss']
})
export class DrawsComponent implements OnInit {
  activeDraws: Draw[] = [];
  draws: Draw[] = [];
  loading: boolean = true;
  joinedDrawIds: Set<number> = new Set();
  @ViewChild('dt', { static: false }) table!: Table;



  // Modal properties
  showJoinModal: boolean = false;
  selectedDrawId: number | null = null;
  currentUserId: number = 1;

  private apiUrl = 'http://localhost:3333';

  constructor(
    private router: Router,
    private messageService: MessageService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadDraws();
    this.currentUserId = this.getCurrentUserId();
  }

  loadDraws(): void {
    this.loading = true;

    this.http.get<{ success: boolean; data: Draw[] }>(`${this.apiUrl}/draws`)
      .subscribe({
        next: (response) => {
          this.draws = response.data;
          this.activeDraws = this.draws.filter(draw => draw.status === 'active');

          this.activeDraws.forEach(draw => {
            this.loadParticipantCount(draw);
          });

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading draws:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load draws'
          });
          this.loading = false;
        }
      });
  }

  // Load only draws the user joined
  loadMyDraws() {
    this.loading = true;

    this.http.get<{ success: boolean; data: Draw[] }>(
      `${this.apiUrl}/draws?userId=${this.currentUserId}`
    )
      .subscribe({
        next: (res) => {
          // Ensure we always have an array, even if res.data is undefined
          this.activeDraws = res.data || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading my draws:', error);
          this.activeDraws = []; // Reset to empty array on error
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load your draws'
          });
        }
      });
  }

  manualExportCSV() {
    if (!this.activeDraws || this.activeDraws.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No data available to export'
      });
      return;
    }

    try {
      const csvContent = this.convertToCSV(this.activeDraws);
      this.downloadCSV(csvContent, 'draws-export.csv');
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Data exported successfully'
      });
    } catch (error) {
      console.error('Manual export error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Export Failed',
        detail: 'Could not export data'
      });
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.map(header => `"${header}"`).join(',');

    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header] === null || row[header] === undefined ? '' : row[header];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  private downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.table.filterGlobal(input?.value || '', 'contains');
  }

  loadParticipantCount(draw: Draw): void {
    this.http.get<{ success: boolean; data: Participation[] }>(
      `${this.apiUrl}/draws/${draw.id}/participants`
    ).subscribe({
      next: (response) => {
        draw.participantCount = response.data.length;

        const userParticipation = response.data.find(p => p.userId === this.currentUserId);
        if (userParticipation) {
          this.joinedDrawIds.add(draw.id);
        }
      },
      error: (error) => {
        console.error(`Error loading participants for draw ${draw.id}:`, error);
      }
    });
  }
  openJoinModal(draw: Draw): void {
    this.selectedDrawId = draw.id;
    // Use setTimeout to ensure drawId is set before modal opens
    setTimeout(() => {
      this.showJoinModal = true;
    }, 0);
  }

  onJoinSuccess(): void {
    // Reload draws to update participant counts and joined status
    this.loadDraws();
  }

  isJoined(drawId: number): boolean {
    return this.joinedDrawIds.has(drawId);
  }

  getButtonLabel(drawId: number): string {
    return this.isJoined(drawId) ? 'Joined' : 'Join Draw';
  }

  getButtonIcon(drawId: number): string {
    return this.isJoined(drawId) ? 'pi pi-check' : 'pi pi-plus';
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'closed':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'info';
    }
  }

  private getCurrentUserId(): number {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch {
        return 1;
      }
    }
    return 1;
  }
}