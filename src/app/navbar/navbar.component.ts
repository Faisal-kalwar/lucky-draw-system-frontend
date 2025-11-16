import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavbarComponent implements OnInit {
  user: any = null;
  menuItems: MenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.updateMenu();
    });
  }

  updateMenu() {
    this.menuItems = [];

    // Home link (always visible)
    this.menuItems.push({
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: ['/']
    });

    // User links
    if (this.user?.role === 'user') {
      this.menuItems.push({
        label: 'Available Draws',
        icon: 'pi pi-gift',
        routerLink: ['/available-draws']
      });
    }

    // Admin links
    if (this.user?.role === 'admin') {
      this.menuItems.push({
        label: 'Dashboard',
        icon: 'pi pi-chart-line',
        routerLink: ['/admin/dashboard']
      });
      this.menuItems.push({
        label: 'All Draws',
        icon: 'pi pi-list',
        routerLink: ['/admin/draws']
      });
      // this.menuItems.push({
      //   label: 'Create Draw',
      //   icon: 'pi pi-plus',
      //   routerLink: ['/admin/draws/create']
      // });
        this.menuItems.push({
        label: 'Users',
        icon: 'pi pi-users',
        routerLink: ['/admin/users']
      });
    }

    // Login/Logout
    if (!this.user) {
      this.menuItems.push({
        label: 'Login',
        icon: 'pi pi-sign-in',
        routerLink: ['/login']
      });
    } else {
      this.menuItems.push({
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}