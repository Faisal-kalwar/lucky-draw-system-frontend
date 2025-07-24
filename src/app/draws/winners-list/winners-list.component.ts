import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Import this
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'app-winners-list',
  standalone: true, // <-- Add if you're using standalone components
  imports: [CommonModule,FormsModule], // <-- Add CommonModule here
  templateUrl: './winners-list.component.html',
  styleUrls: ['./winners-list.component.scss']
})
export class WinnersListComponent {
  drawId: number;
  winners: any[] = [];
  message: string = ''; // <-- Fix for error #2
  loading: boolean = false; 
  manualUserId: number = 0;
  manualEmail: any;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.drawId = Number(this.route.snapshot.paramMap.get('id'));
  }

pickWinners() {
  this.loading = true;
  this.http.post<any>(`http://127.0.0.1:3333/admin/draws/${this.drawId}/draw-winners`, { count: 3 }).subscribe({
    next: (res) => {
      this.message = res.message || 'Winners picked!';
      this.loadWinners(); // This sets loading = false
    },
    error: (err) => {
      this.message = err.error?.message || 'Failed to pick winners';
      this.loading = false;
    },
  });
}

loadWinners() {
  this.loading = true;
  this.http.get<any>(`http://127.0.0.1:3333/admin/draws/${this.drawId}/participants`).subscribe({
    next: (res) => {
      this.winners = res.data?.filter((p: any) => p.isWinner);
      this.loading = false;
    },
    error: () => {
      this.loading = false;
    }
  });
}
addParticipationByEmail() {
  if (!this.manualEmail.trim()) {
    this.message = '❗ Please enter a valid email address';
    return;
  }

  this.http.post<any>(`http://127.0.0.1:3333/admin/draws/${this.drawId}/add-participant-by-email`, {
    email: this.manualEmail,
    drawId: this.drawId,
  }).subscribe({
    next: (res) => {
      this.message = res.message || 'Participant added successfully!';
      this.manualEmail = '';
      this.loadWinners(); // Refresh winner list
    },
    error: (err) => {
      this.message = err.error?.message || 'Failed to add participant by email';
    }
  });
}


  ngOnInit() {
    this.loadWinners();
  }
}
