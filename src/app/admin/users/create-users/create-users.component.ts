import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  payment_option?: string;
  createdAt?: string; // ✅ optional
}

@Component({
  selector: 'app-create-edit-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    PasswordModule
  ],
  templateUrl: './create-users.component.html',
  styleUrls: ['./create-users.component.scss'] 
})
export class CreateEditUserModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() user: User | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() userSaved = new EventEmitter<User>();

  userForm!: FormGroup;
  loading: boolean = false;
  isEditMode: boolean = false;
  showPasswordField: boolean = false;

  roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Inactive', value: 'inactive' }
  ];

  paymentOptions = [
    { label: 'JazzCash', value: 'jazzcash' },
    { label: 'EasyPaisa', value: 'easypaisa' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Credit Card', value: 'credit_card' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges() {
    if (this.user) {
      this.isEditMode = true;
      this.populateForm();
    } else {
      this.isEditMode = false;
      this.initializeForm();
    }
  }

  initializeForm() {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required],
      status: ['pending', Validators.required],
      payment_option: ['']
    });
  }

  populateForm() {
    if (this.user) {
      this.userForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        role: this.user.role,
        status: this.user.status,
        payment_option: this.user.payment_option || ''
      });
      
      // Remove password validation in edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  togglePasswordField() {
    this.showPasswordField = !this.showPasswordField;
    if (this.showPasswordField) {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.setValue('');
    }
    this.userForm.get('password')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      
      const formData = { ...this.userForm.value };
      
      // Remove password if in edit mode and not changing it
      if (this.isEditMode && !this.showPasswordField) {
        delete formData.password;
      }
      
      // Add user ID if in edit mode
      if (this.isEditMode && this.user?.id) {
        formData.id = this.user.id;
      }

      // Emit the user data
      this.userSaved.emit(formData);
      
      // Reset form and close dialog
      setTimeout(() => {
        this.loading = false;
        this.closeDialog();
      }, 500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.closeDialog();
  }

  onDialogHide() {
    this.closeDialog();
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.userForm.reset();
    this.showPasswordField = false;
    this.user = null;
    this.isEditMode = false;
  }
}