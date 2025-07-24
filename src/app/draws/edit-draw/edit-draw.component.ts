import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-draw',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-draw.component.html',
})
export class EditDrawComponent implements OnInit {
  drawForm!: FormGroup;
  drawId!: number;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.drawId = Number(this.route.snapshot.paramMap.get('id'));

    this.drawForm = this.fb.group({
      prizeName: ['', Validators.required],
      drawDate: ['', Validators.required],
      description: [''],
      maxParticipants: [null],
      status: ['upcoming'], // default
    });

    this.fetchDraw();
  }

  fetchDraw() {
    this.http.get<any>(`http://127.0.0.1:3333/api/draws/${this.drawId}`).subscribe({
      next: (res) => {
        const draw = res.data;
        this.drawForm.patchValue(draw);
        this.loading = false;
      },
      error: () => {
        alert('Failed to load draw.');
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.drawForm.invalid) return;

    this.http.put(`http://127.0.0.1:3333/api/draws/${this.drawId}`, this.drawForm.value).subscribe({
      next: () => {
        alert('✅ Draw updated successfully!');
        this.router.navigate(['/admin/draws']);
      },
      error: () => {
        alert('❌ Failed to update draw.');
      },
    });
  }
}
