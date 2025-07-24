import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { CommonModule } from '@angular/common'

// Define interfaces based on your AdonisJS models
interface User {
  id: number
  name: string
  email: string
}

interface Participation {
  id: number
  userId: number
  drawId: number
  isWinner: boolean | null
  user: User
}

interface Draw {
  id: number
  prizeName: string
  description?: string
  drawDate: string
  maxParticipants?: number
  currentParticipants?: number
  entryFee?: number
  isActive: boolean
  participants?: Participation[]
}

interface ApiResponse<T> {
  data: T
  message?: string
}

@Component({
  selector: 'app-join-draw',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-draw.component.html',
})
export class JoinDrawComponent implements OnInit {
  drawId: number = 0
  draw: Draw | null = null
  message: string | null = null
  isLoading: boolean = false
  currentUserId: number | null = null

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (!id) {
      this.message = '❌ Invalid draw ID.'
      return
    }

    this.drawId = Number(id)
    if (isNaN(this.drawId)) {
      this.message = '❌ Invalid draw ID.'
      return
    }

    // Get current user ID
    this.currentUserId = this.getCurrentUserId()
    
    this.loadDraw()
  }

  loadDraw(): void {
    this.isLoading = true
    this.message = null

    // Include participants in the API call
    this.http.get<ApiResponse<Draw>>(`http://127.0.0.1:3333/draws/${this.drawId}?include=participants.user`).subscribe({
      next: (res) => {
        this.draw = res.data
        this.isLoading = false
      },
      error: (err) => {
        console.error('Error loading draw:', err)
        this.message = '❌ Failed to load draw.'
        this.isLoading = false
      }
    })
  }

  join(): void {
    if (!this.draw) {
      this.message = '❌ No draw loaded.'
      return
    }

    if (!this.currentUserId) {
      this.message = '❌ Please log in to join the draw.'
      return
    }

    if (this.isUserAlreadyJoined()) {
      this.message = '❌ You have already joined this draw.'
      return
    }

    if (this.isDrawClosed()) {
      this.message = '❌ This draw is no longer accepting participants.'
      return
    }

    this.isLoading = true
    this.message = null

    this.http.post<ApiResponse<any>>(`http://127.0.0.1:3333/draws/${this.drawId}/join`, { 
      userId: this.currentUserId 
    }).subscribe({
      next: (res) => {
        this.message = res.message || '✅ Successfully joined the draw!'
        this.isLoading = false
        // Reload the draw to get updated participant list
        this.loadDraw()
      },
      error: (err) => {
        console.error('Error joining draw:', err)
        this.message = err.error?.message || '❌ Failed to join the draw.'
        this.isLoading = false
      }
    })
  }

  isUserAlreadyJoined(): boolean {
    if (!this.draw?.participants || !this.currentUserId) {
      return false
    }
    
    return this.draw.participants.some(p => p.userId === this.currentUserId)
  }

  isDrawClosed(): boolean {
    if (!this.draw) return true
    
    // Check if draw is still active
    if (!this.draw.isActive) return true
    
    // Check if draw date has passed
    const drawDate = new Date(this.draw.drawDate)
    const now = new Date()
    if (drawDate <= now) return true
    
    // Check if max participants reached
    if (this.draw.maxParticipants && this.draw.currentParticipants) {
      return this.draw.currentParticipants >= this.draw.maxParticipants
    }
    
    return false
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  private getCurrentUserId(): number | null {
    // TODO: Implement proper user authentication service
    // This should get the actual logged-in user ID from your auth service
    // Example:
    // return this.authService.getCurrentUser()?.id || null
    
    // For development, you can use localStorage or sessionStorage
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        return user.id
      } catch {
        return null
      }
    }
    
    // Mock user ID for development
    return 1
  }
}