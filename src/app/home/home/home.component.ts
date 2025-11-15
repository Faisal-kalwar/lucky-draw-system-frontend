import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredDraws = [];
  isLoading = true;
  hasError = false;

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchFeaturedDraws();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchFeaturedDraws(): void {
    this.isLoading = true;

    this.http
      .get<any>('http://localhost:3333/draws')
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.hasError = true;
          this.isLoading = false;
          return of({ success: false, data: [] });
        })
      )
      .subscribe((res) => {
        this.isLoading = false;

        if (!res.success) return;

        this.featuredDraws = res.data
          ?.filter((d: any) => ['Open', 'Upcoming'].includes(d.status))
          ?.slice(0, 6); // limit to 6
      });
  }
}
