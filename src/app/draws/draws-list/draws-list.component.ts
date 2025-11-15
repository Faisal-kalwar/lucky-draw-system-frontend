import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
{ }

interface Draw {
  id: number;
  prizeName: string;
  drawDate: string;
  maxParticipants: number | null;
  status: 'active' | 'upcoming' | 'closed';
  [key: string]: any; // For additional properties
}

@Component({
  selector: 'app-draws-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './draws-list.component.html',
  styleUrls: ['./draws-list.component.scss']
})
export class DrawsListComponent implements OnInit {
  draws: Draw[] = [];
  loading: boolean = false;
  error: string | null = null;
  userRole: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadUserData();
    this.fetchDraws();
  }

  private loadUserData(): void {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      this.userRole = user?.role || null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      this.userRole = null;
    }
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  fetchDraws(): void {
    this.loading = true;
    this.error = null;

    this.http.get<{ data: Draw[] }>('http://127.0.0.1:3333/draws').subscribe({
      next: (res) => {
        this.draws = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch draws:', err);
        this.error = 'Failed to load draws. Please try again later.';
        this.loading = false;
      }
    });
  }

  deleteDraw(id: number): void {
    if (!confirm('Are you sure you want to delete this draw? This action cannot be undone.')) {
      return;
    }

    this.http.delete(`http://127.0.0.1:3333/draws/${id}`).subscribe({
      next: () => {
        this.draws = this.draws.filter(d => d.id !== id);
      },
      error: (err) => {
        console.error('Failed to delete draw:', err);
        alert('Failed to delete draw. Please try again.');
      }
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
  joinDraw(drawId: number) {
    if (!confirm('Are you sure you want to join this draw?')) return

    const token = localStorage.getItem('token')
    if (!token) {
      alert('You need to be logged in.')
      return
    }

    this.http.post(`http://127.0.0.1:3333/entries/join`, { draw_id: drawId }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        alert('✅ Successfully joined the draw!')
        // Optionally reload entries or update UI
      },
      error: (err) => {
        console.error('Failed to join draw:', err)
        alert(err.error.message || '❌ Could not join the draw.')
      }
    })
  }

}