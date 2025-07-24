import { Component, OnInit } from '@angular/core'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-draws-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './draws-list.component.html',
  styleUrls: ['./draws-list.component.scss']  // ✅ Correct key
})
export class DrawsListComponent implements OnInit {
  draws: any[] = []
  loading: boolean = false

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchDraws()
  }

  fetchDraws() {
    this.loading = true
    this.http.get<any>('http://127.0.0.1:3333/draws').subscribe({
      next: (res) => {
        this.draws = res.data
        console.log(this.draws);
        this.loading = false
      },
      error: (err) => {
        console.error('❌ Failed to fetch draws:', err)
        this.loading = false
      },
    })
  }

  editDraw(draw: any) {
    alert('🔧 Edit feature coming soon!')
  }

  deleteDraw(id: number) {
    if (!confirm('Are you sure you want to delete this draw?')) return

    this.http.delete(`http://127.0.0.1:3333/draws/${id}`).subscribe({
      next: () => {
        this.draws = this.draws.filter(d => d.id !== id)
      },
      error: (err) => {
        alert('Failed to delete')
      }
    })
  }
}
