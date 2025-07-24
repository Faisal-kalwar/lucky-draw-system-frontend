import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'
@Component({
  selector: 'app-draws',
  imports: [CommonModule],
  templateUrl: './draws.component.html',
  styleUrl: './draws.component.scss'
})
export class DrawsComponent {
 draws = [
  {
    id: 1,
    prizeName: 'Samsung Galaxy S24',
    description: 'Brand new phone giveaway!',
    drawDate: '2025-07-25',
    status: 'Open',
    joined: false
  },
  {
    id: 2,
    prizeName: 'PS5 Console',
    description: 'Win a PS5 gaming console!',
    drawDate: '2025-08-01',
    status: 'Closed',
    joined: true
  },
];

  constructor(private router: Router) {}
 ngOnInit(): void {
  // Optional initialization logic can go here
}

  joinDraw(drawId: number) {
    // Navigate to join page or show join modal
    this.router.navigate(['/draws/join', drawId])
  }
}
