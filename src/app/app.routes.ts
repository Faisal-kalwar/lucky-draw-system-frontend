import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

export const routes: Routes = [
  // 🏠 HOME PAGE - Publicly accessible (Entry Point)
  { 
    path: '', 
    loadComponent: () =>
      import('./home/home/home.component').then(m => m.HomeComponent)
  },

  // 🔐 AUTHENTICATION ROUTES - Public Access
  { 
    path: 'login', 
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () =>
      import('./auth/register/register.component').then(m => m.RegisterComponent)
  },

  // 👤 USER PROTECTED ROUTES - Require 'user' role
  { 
    path: 'draws', 
    loadComponent: () =>
      import('./draws/draws-list/draws-list.component').then(m => m.DrawsListComponent),
    canActivate: [AuthGuard], 
    data: { role: 'user' } 
  },
  { 
    path: 'draws/join/:id', 
    loadComponent: () =>
      import('./draws/join-draw/join-draw.component').then(m => m.JoinDrawComponent),
    canActivate: [AuthGuard], 
    data: { role: 'user' } 
  },
  { 
    path: 'my-draws', 
    loadComponent: () =>
      import('./participations/my-participations/my-participations.component').then(m => m.MyParticipationsComponent),
    canActivate: [AuthGuard], 
    data: { role: 'user' } 
  },
  { 
    path: 'my-entries', 
    loadComponent: () =>
      import('./users/my-entries/my-entries/my-entries.component').then(m => m.MyEntriesComponent),
    canActivate: [AuthGuard], 
    data: { role: 'user' } 
  },

  // 🛠️ ADMIN PROTECTED ROUTES - Require 'admin' role
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard, AdminGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/draws',
    loadComponent: () =>
      import('./admin/view-draws/view-draws.component').then(m => m.ViewDrawsComponent),
    canActivate: [AuthGuard, AdminGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/draws/create',
    loadComponent: () =>
      import('./admin/create-draw/create-draw.component').then(m => m.CreateDrawComponent),
    canActivate: [AuthGuard, AdminGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/draws/edit/:id',
    loadComponent: () =>
      import('./draws/edit-draw/edit-draw.component').then(m => m.EditDrawComponent),
    canActivate: [AuthGuard, AdminGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/draws/:drawId/participants',
    loadComponent: () =>
      import('./participants/participants/participants.component').then(m => m.ParticipantsComponent),
    canActivate: [AuthGuard, AdminGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/draws/:id/winners',
    loadComponent: () =>
      import('./draws/winners-list/winners-list.component').then(m => m.WinnersListComponent),
    canActivate: [AuthGuard, AdminGuard],
    data: { role: 'admin' }
  },

  // 🚫 FALLBACK ROUTES
  { 
    path: '**', 
    redirectTo: '' 
  }
];
