import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Needed

@Component({
  selector: 'app-my-participations',
  standalone: true, // ✅ Required if you're not using NgModule
  imports: [CommonModule], // ✅ Fixes all 3 errors
  templateUrl: './my-participations.component.html',
  styleUrl: './my-participations.component.scss'
})
export class MyParticipationsComponent {
  joinedDraws = [
    {
      id: 1,
      prizeName: 'iPhone 15 Pro Max',
      drawDate: new Date('2025-07-30'),
      status: 'Open',
      result: 'Pending',
    },
    {
      id: 2,
      prizeName: 'Netflix 1 Year Subscription',
      drawDate: new Date('2025-07-20'),
      status: 'Closed',
      result: 'Not Selected',
    },
    {
      id: 3,
      prizeName: 'Cash Prize $500',
      drawDate: new Date('2025-07-10'),
      status: 'Closed',
      result: 'Winner',
    },
  ];
}
