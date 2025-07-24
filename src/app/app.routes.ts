import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DrawsListComponent } from './draws/draws-list/draws-list.component';
import { JoinDrawComponent } from './draws/join-draw/join-draw.component';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard'; // You'll need this for admin-only routes
import { MyParticipationsComponent } from './participations/my-participations/my-participations.component';
import { MyEntriesComponent } from './users/my-entries/my-entries/my-entries.component';
import { ParticipantsComponent } from './participants/participants/participants.component';
import { HomeComponent } from './home/home/home.component';

export const routes: Routes = [
  // 🏠 HOME PAGE - Publicly accessible (Entry Point)
  { 
    path: '', 
    component: HomeComponent 
  },

  // 🔐 AUTHENTICATION ROUTES - Public Access
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },

  // 👤 USER PROTECTED ROUTES - Require 'user' role
  { 
    path: 'draws', 
    component: DrawsListComponent, 
    canActivate: [AuthGuard], 
    data: { role: 'user' } 
  },
  { 
    path: 'draws/join/:id', 
    component: JoinDrawComponent, 
    canActivate: [AuthGuard], 
    data: { role: 'user' } 
  },
  { 
    path: 'my-draws', 
    component: MyParticipationsComponent, 
    canActivate: [AuthGuard], 
    data: { role: 'user' } 
  },
  { 
    path: 'my-entries', 
    component: MyEntriesComponent, 
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
    component: ParticipantsComponent,
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

// 📝 ROUTE FLOW SUMMARY:
/*
1. HOME PAGE (/) - Public entry point showing featured draws
2. LOGIN (/login) - Redirects to:
   - /admin/dashboard (if admin)
   - /draws (if user)
3. REGISTER (/register) - Customer sign-up only
4. USER FLOW:
   - /draws → List of open draws
   - /draws/join/:id → Join specific draw
   - /my-draws → User's participated draws  
   - /my-entries → User's entries/tickets
5. ADMIN FLOW:
   - /admin/dashboard → Overview
   - /admin/draws → View all draws
   - /admin/draws/create → Create new draw
   - /admin/draws/edit/:id → Edit existing draw
   - /admin/draws/:drawId/participants → View participants
   - /admin/draws/:id/winners → View winners
*/