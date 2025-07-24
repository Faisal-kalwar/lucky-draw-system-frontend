import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-my-entries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-entries.component.html',
})
export class MyEntriesComponent {
  entries = [
    { prizeName: 'Samsung Galaxy S24', drawDate: '2025-07-25', status: 'joined' },
    { prizeName: 'PS5 Console', drawDate: '2025-08-01', status: 'pending' },
  ]
}
