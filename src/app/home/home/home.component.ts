import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { CarouselModule } from 'primeng/carousel';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';

interface Draw {
  id: number;
  prizeName: string;
  description: string;
  drawDate: string;
  maxParticipants: number;
  status: string;
  participants: number;
}

interface Winner {
  id: number;
  user: {
    fullName: string;
    email: string;
  };
  draw: {
    prizeName: string;
  };
  createdAt: string;
}

interface Stats {
  totalDraws: number;
  totalParticipants: number;
  totalWinners: number;
  activeDraws: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    CarouselModule,
    DividerModule,
    AvatarModule,
    BadgeModule,
    RippleModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredDraws: Draw[] = [];
  recentWinners: Winner[] = [];
  stats: Stats = {
    totalDraws: 0,
    totalParticipants: 0,
    totalWinners: 0,
    activeDraws: 0
  };
  
  isLoading = true;
  hasError = false;

  private destroy$ = new Subject<void>();

  carouselResponsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  features = [
    {
      icon: 'pi pi-shield',
      title: '100% Secure',
      description: 'All draws are conducted transparently with complete fairness guaranteed.',
      color: 'primary'
    },
    {
      icon: 'pi pi-bolt',
      title: 'Instant Results',
      description: 'Winners are announced immediately after each draw completion.',
      color: 'success'
    },
    {
      icon: 'pi pi-gift',
      title: 'Amazing Prizes',
      description: 'Win smartphones, cash prizes, and exclusive rewards.',
      color: 'warning'
    },
    {
      icon: 'pi pi-users',
      title: 'Large Community',
      description: 'Join thousands of participants in exciting lucky draws.',
      color: 'info'
    }
  ];

  testimonials = [
    {
      name: 'Ayesha Khan',
      location: 'Karachi',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      rating: 5,
      text: 'I won an iPhone 14 Pro! The process was smooth and delivery was incredibly fast. LuckyWin is definitely legit!'
    },
    {
      name: 'Ali Raza',
      location: 'Lahore',
      image: 'https://randomuser.me/api/portraits/men/22.jpg',
      rating: 5,
      text: 'The transparency of the live draws convinced me. Already won a smartwatch and cash prizes!'
    },
    {
      name: 'Sana Ahmed',
      location: 'Islamabad',
      image: 'https://randomuser.me/api/portraits/women/45.jpg',
      rating: 5,
      text: 'Amazing customer support! They helped me with everything. The community is great!'
    }
  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchData(): void {
    this.isLoading = true;

    // Fetch featured draws
    this.http
      .get<{ success: boolean; data: Draw[] }>('http://localhost:3333/draws')
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.hasError = true;
          return of({ success: false, data: [] });
        })
      )
      .subscribe((res) => {
        if (res.success) {
          this.featuredDraws = res.data
            .filter(d => d.status === 'active')
            .slice(0, 6);
          
          // Calculate stats from draws
          this.stats.totalDraws = res.data.length;
          this.stats.activeDraws = res.data.filter(d => d.status === 'active').length;
          this.stats.totalParticipants = res.data.reduce((sum, d) => sum + (d.participants || 0), 0);
        }
        this.isLoading = false;
      });

    // You can add API calls for winners and stats here
    // this.fetchRecentWinners();
    // this.fetchStats();
  }

  joinDraw(draw: Draw): void {
    this.router.navigate(['/draws', draw.id]);
  }

  viewAllDraws(): void {
    this.router.navigate(['/draws']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
}