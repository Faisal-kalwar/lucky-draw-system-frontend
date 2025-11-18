import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { CreateEditUserModalComponent } from '../users/create-users/create-users.component'; // correct path


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
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    CreateEditUserModalComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersListComponent implements OnInit {
  @ViewChild('dt') table!: Table;

  users: User[] = [];
  loading: boolean = false;
  modalVisible: boolean = false;
  selectedUser: User | null = null;
  private apiUrl = 'http://localhost:3333'; // Adjust based on your API

  constructor(
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/users`).subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
        this.loading = false;
      }
    });
  }

  getRoleSeverity(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'danger';
      case 'user': return 'info';
      default: return 'secondary';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'inactive': return 'secondary';
      default: return 'info';
    }
  }

  approveUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to approve ${user.fullName}?`,
      header: 'Approve User',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.http.post(`${this.apiUrl}/users/${user.id}/approve`, {}).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User approved successfully'
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error approving user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to approve user'
            });
          }
        });
      }
    });
  }

  rejectUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to reject ${user.fullName}?`,
      header: 'Reject User',
      icon: 'pi pi-times-circle',
      accept: () => {
        this.http.post(`${this.apiUrl}/users/${user.id}/reject`, {}).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User rejected successfully'
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error rejecting user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to reject user'
            });
          }
        });
      }
    });
  }

  // editUser(user: User) {
  //   // Implement edit functionality - maybe open a dialog
  //   console.log('Edit user:', user);
  //   this.messageService.add({
  //     severity: 'info',
  //     summary: 'Edit User',
  //     detail: 'Edit functionality to be implemented'
  //   });
  // }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`,
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`${this.apiUrl}/users/${user.id}`).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User deleted successfully'
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete user'
            });
          }
        });
      }
    });
  }

  openCreateModal() {
    this.selectedUser = null; // reset any selected user
    this.modalVisible = true;
  }

  // Open modal for edit
  editUser(user: User) {
    this.selectedUser = user;
    this.modalVisible = true;
  }

  // Handle modal save event
  onUserSaved(userData: User) {
    if (userData.id) {
      // Update user logic
      this.http.put(`${this.apiUrl}/users/${userData.id}`, userData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
          this.loadUsers();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user' });
        }
      });
    } else {
      // Create user logic
      this.http.post(`${this.apiUrl}/register`, userData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
          this.loadUsers();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user' });
        }
      });
    }

    // Close modal
    this.modalVisible = false;
  }

    exportCSV() {
    if (!this.users || this.users.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No data available to export'
      });
      return;
    }

    try {
      const csvContent = this.convertToCSV(this.users);
      this.downloadCSV(csvContent, 'users-export.csv');
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Data exported successfully'
      });
    } catch (error) {
      console.error('Manual export error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Export Failed',
        detail: 'Could not export data'
      });
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.map(header => `"${header}"`).join(',');

    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header] === null || row[header] === undefined ? '' : row[header];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  private downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}