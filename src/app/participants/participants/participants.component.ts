import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participants.component.html',
})
export class ParticipantsComponent {
  draw: any
  participants: any[] = []
  winner: any = null

  constructor(private route: ActivatedRoute) {
    const drawId = this.route.snapshot.paramMap.get('drawId')

    // Mock draw
    this.draw = {
      id: drawId,
      prizeName: 'iPhone 15',
    }

    // Mock participants
    this.participants = [
      { id: 1, fullName: 'Faisal Kalwar', email: 'faisal@email.com' },
      { id: 2, fullName: 'Abiha B', email: 'abiha@email.com' },
      { id: 3, fullName: 'Zayn', email: 'zayn@email.com' },
    ]
  }

  selectWinner() {
    const randomIndex = Math.floor(Math.random() * this.participants.length)
    this.winner = this.participants[randomIndex]
  }
}
