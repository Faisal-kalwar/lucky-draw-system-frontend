import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-view-draws',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-draws.component.html',
})
export class ViewDrawsComponent {
  draws = [
    { id: 1, prizeName: 'iPhone 15', drawDate: '2025-07-20' },
    { id: 2, prizeName: 'PS5', drawDate: '2025-07-25' },
  ]

  constructor(private router: Router) {}

  viewParticipants(draw: any) {
    // 👥 Will go to participant list page
    this.router.navigate(['/admin/participants', draw.id])
  }

  runDraw(draw: any) {
    // 🧠 Later this will call the API
    alert(`🎉 Winner selected for: ${draw.prizeName}`)
  }
}
