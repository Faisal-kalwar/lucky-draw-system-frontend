import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-create-draw',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    CalendarModule,
    InputTextarea,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    MessageModule,
    ToastModule,
    DialogModule
  ],
  providers: [MessageService],
  templateUrl: './create-draw.component.html',
  styleUrls: ['./create-draw.component.scss']
})
export class CreateDrawComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() drawId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() drawCreated = new EventEmitter<void>();

  drawForm!: FormGroup;
  isEditMode = false;
  loading = false;

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.drawForm = this.fb.group({
      prizeName: ['', Validators.required],
      description: [''],
      drawDate: ['', Validators.required],
      maxParticipants: [null, [Validators.required, Validators.min(1)]],
      status: ['active', Validators.required]
    });
  }

  ngOnChanges(): void {
    if (this.visible && this.drawId) {
      this.isEditMode = true;
      this.loadDraw();
    } else if (this.visible && !this.drawId) {
      this.isEditMode = false;
      this.drawForm.reset({ status: 'active' });
    }
  }

  loadDraw() {
    this.loading = true;
    this.http.get(`http://localhost:3333/draws/${this.drawId}`).subscribe({
      next: (res: any) => {
        const draw = res.data;
        this.drawForm.patchValue({
          prizeName: draw.prizeName,
          description: draw.description,
          drawDate: new Date(draw.drawDate),
          maxParticipants: draw.maxParticipants,
          status: draw.status
        });
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load draw details'
        });
        this.loading = false;
      }
    });
  }

  submitDraw() {
    if (this.drawForm.invalid) {
      Object.keys(this.drawForm.controls).forEach(key => {
        this.drawForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const payload = this.drawForm.value;

    if (this.isEditMode) {
      this.http.put(`http://localhost:3333/draws/${this.drawId}`, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Draw updated successfully!'
          });
          this.loading = false;
          this.closeModal();
          this.drawCreated.emit();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update draw'
          });
          this.loading = false;
        }
      });
    } else {
      this.http.post('http://localhost:3333/store', payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'New draw created successfully!'
          });
          this.loading = false;
          this.drawForm.reset({ status: 'active' });
          this.closeModal();
          this.drawCreated.emit();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create draw'
          });
          this.loading = false;
        }
      });
    }
  }

  closeModal() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.drawForm.reset({ status: 'active' });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.drawForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}