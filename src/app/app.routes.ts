import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/user-layout/user-layout.component').then(m => m.UserLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./home/home/home.component').then(m => m.HomeComponent) },
      { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
      {
        path: 'participators',
        canActivate: [AuthGuard],
        data: { role: 'user' },
        loadComponent: () => import('./participations/my-participations/my-participations.component').then(m => m.MyParticipationsComponent),
      },
      {
        path: 'available-draws',
        canActivate: [AuthGuard],
        data: { role: 'user' },
        loadComponent: () => import('./draws/draws/draws.component').then(m => m.DrawsComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'draws', loadComponent: () => import('./admin/view-draws/view-draws.component').then(m => m.ViewDrawsComponent) },
      { path: 'draws/create', loadComponent: () => import('./admin/create-draw/create-draw.component').then(m => m.CreateDrawComponent) },
      { path: 'draws/:id/winners', loadComponent: () => import('./draws/winners-list/winners-list.component').then(m => m.WinnersListComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
