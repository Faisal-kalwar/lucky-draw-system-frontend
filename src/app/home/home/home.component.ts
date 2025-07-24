import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';

interface Draw {
  id: string;
  prizeName: string;
  description: string;
  drawDate: string;
  status: string;
  ticketPrice?: number;
  maxParticipants?: number;
  totalParticipants?: number;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Draw[];
  message?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredDraws: Draw[] = [];
  isLoading = true;
  hasError = false;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedDraws();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load featured draws from the API
   * Only shows open and upcoming draws, limited to 6 items
   */
  loadFeaturedDraws(): void {
    this.isLoading = true;
    this.hasError = false;

    this.http.get<ApiResponse>('http://localhost:3333/draws')
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to load featured draws:', error);
          this.hasError = true;
          this.isLoading = false;
          return of({ success: false, data: [] });
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Filter and sort draws for featured display
            this.featuredDraws = response.data
              .filter(draw => ['Open', 'Upcoming'].includes(draw.status))
              .sort((a, b) => {
                // Prioritize open draws, then by draw date
                if (a.status === 'Open' && b.status !== 'Open') return -1;
                if (b.status === 'Open' && a.status !== 'Open') return 1;
                return new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime();
              })
              .slice(0, 6); // Show maximum 6 featured draws
          } else {
            this.featuredDraws = [];
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading featured draws:', error);
          this.hasError = true;
          this.isLoading = false;
          this.featuredDraws = [];
        }
      });
  }

  /**
   * Handle join draw button click
   * Redirects to login if not authenticated
   */
  onJoinDrawClick(draw: Draw): void {
    if (draw.status !== 'Open') {
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login with return URL
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/draws/join/${draw.id}` }
      });
    } else {
      // Navigate to join draw page
      this.router.navigate(['/draws/join', draw.id]);
    }
  }

  /**
   * Format draw date for display
   */
  formatDrawDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid Date';
    }
  }

  /**
   * Calculate time remaining until draw
   */
  getTimeRemaining(dateString: string): string {
    try {
      const drawDate = new Date(dateString);
      const now = new Date();
      const timeDiff = drawDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        return 'Draw Ended';
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days}d ${hours}h`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      } else {
        return 'Soon';
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * TrackBy function for draw list performance
   */
  trackByDrawId(index: number, draw: Draw): string {
    return draw.id;
  }

  /**
   * Refresh featured draws manually
   */
  refreshDraws(): void {
    this.loadFeaturedDraws();
  }
}