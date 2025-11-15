import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Participation {
  id: number;
  userId: number;
  drawId: number;
  isWinner: boolean | null;
  user: User;
}

interface Draw {
  id: number;
  prizeName: string;
  description?: string;
  drawDate: string;
  maxParticipants?: number;
  participantCount?: number;
  entryFee?: number;
  status: string;
  participants?: Participation[];
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Component({
  selector: 'app-join-draw',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    ChipModule,
    TagModule,
    InputTextModule,
    InputTextarea,
    DropdownModule
  ],
  templateUrl: './join-draw.component.html',
  styleUrls: ['./join-draw.component.scss']
})
export class JoinDrawModalComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() drawId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() joinSuccess = new EventEmitter<void>();

  draw: Draw | null = null;
  isLoading: boolean = false;
  currentUserId: number = 1;
  showForm: boolean = false;
  joinForm!: FormGroup;
  
  // Bank options for dropdown
  banks = [
    { label: 'Select Bank', value: null },
    { label: 'HBL - Habib Bank Limited', value: 'HBL' },
    { label: 'UBL - United Bank Limited', value: 'UBL' },
    { label: 'MCB - Muslim Commercial Bank', value: 'MCB' },
    { label: 'NBP - National Bank of Pakistan', value: 'NBP' },
    { label: 'Allied Bank Limited', value: 'ABL' },
    { label: 'Bank Alfalah', value: 'BAFL' },
    { label: 'Meezan Bank', value: 'Meezan' },
    { label: 'Standard Chartered', value: 'SC' },
    { label: 'Faysal Bank', value: 'Faysal' },
    { label: 'Bank Al Habib', value: 'BAH' },
    { label: 'JazzCash', value: 'JazzCash' },
    { label: 'Easypaisa', value: 'Easypaisa' },
    { label: 'Other', value: 'Other' }
  ];
  
  private apiUrl = 'http://localhost:3333';

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.currentUserId = this.getCurrentUserId();
    this.initializeForm();
  }

  initializeForm(): void {
    this.joinForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+92|0)?3[0-9]{9}$/)]],
      accountNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      participationNotes: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.drawId) {
      this.loadDraw();
      this.showForm = false;
      this.joinForm.reset();
    }
  }

  loadDraw(): void {
    if (!this.drawId) return;
    this.isLoading = true;
    this.http.get<ApiResponse<Draw>>(
      `${this.apiUrl}/api/draws/${this.drawId}`
    ).subscribe({
      next: (response) => {
        this.draw = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading draw:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load draw details'
        });
        this.isLoading = false;
      }
    });
  }

  proceedToForm(): void {
    if (this.isUserAlreadyJoined()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Already Joined',
        detail: 'You have already joined this draw'
      });
      return;
    }

    if (this.isDrawClosed()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Draw Closed',
        detail: 'This draw is no longer accepting participants'
      });
      return;
    }

    this.showForm = true;
  }

  backToDetails(): void {
    this.showForm = false;
    this.joinForm.reset();
  }

  submitJoin(): void {
    if (this.joinForm.invalid) {
      Object.keys(this.joinForm.controls).forEach(key => {
        this.joinForm.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Form',
        detail: 'Please fill all required fields correctly'
      });
      return;
    }

    if (!this.draw || !this.drawId) return;

    this.isLoading = true;

    const participationData = {
      userId: this.currentUserId,
      ...this.joinForm.value,
      referenceNumber: this.generateReferenceNumber()
    };

    this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/draws/${this.drawId}/join`,
      participationData
    ).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message || 'Successfully joined the draw!'
        });
        this.isLoading = false;
        this.joinSuccess.emit();
        this.onClose();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Failed to join draw';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.isLoading = false;
      }
    });
  }

  generateReferenceNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `REF-${timestamp}-${random}`.toUpperCase();
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.draw = null;
    this.showForm = false;
    this.joinForm.reset();
  }

  isUserAlreadyJoined(): boolean {
    if (!this.draw?.participants) return false;
    return this.draw.participants.some(p => p.userId === this.currentUserId);
  }

  isDrawClosed(): boolean {
    if (!this.draw) return true;
    
    if (this.draw.status !== 'active') return true;
    
    const drawDate = new Date(this.draw.drawDate);
    const now = new Date();
    if (drawDate <= now) return true;
    
    if (this.draw.maxParticipants && this.draw.participantCount) {
      return this.draw.participantCount >= this.draw.maxParticipants;
    }
    
    return false;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'closed':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'info';
    }
  }

  private getCurrentUserId(): number {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch {
        return 1;
      }
    }
    return 1;
  }

  // Form field helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.joinForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.joinForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['pattern']) return 'Invalid format';
    }
    return '';
  }
}