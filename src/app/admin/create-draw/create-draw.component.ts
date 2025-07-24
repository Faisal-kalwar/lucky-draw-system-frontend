import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-draw',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-draw.component.html',
})
export class CreateDrawComponent implements OnInit {
  drawForm!: FormGroup;
  isEditMode = false;
  drawId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.drawForm = this.fb.group({
      prizeName: ['', Validators.required],
      description: [''],
      drawDate: ['', Validators.required],
      maxParticipants: [null],
      status: ['active', Validators.required],
    });

    // Check for edit mode
    this.drawId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.drawId;

    if (this.isEditMode) {
      this.loadDraw();
    }
  }

  loadDraw() {
    this.http.get(`http://localhost:3333/draws/${this.drawId}`).subscribe((res: any) => {
      const draw = res.data;
      this.drawForm.patchValue({
        prizeName: draw.prizeName,
        description: draw.description,
        drawDate: draw.drawDate,
        maxParticipants: draw.maxParticipants,
        status: draw.status,
      });
    });
  }

  submit() {
    if (this.drawForm.invalid) return;

    const payload = this.drawForm.value;

    if (this.isEditMode) {
      // PUT for update
      this.http.put(`http://localhost:3333/draws/${this.drawId}`, payload).subscribe((res) => {
        alert('✅ Draw updated!');
      });
    } else {
      // POST for create
      this.http.post('/api/draws', payload).subscribe((res) => {
        alert('✅ New draw created!');
        this.drawForm.reset();
      });
    }
  }
}
