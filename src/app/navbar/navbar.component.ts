import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  user: any = null;

  constructor(private auth: AuthService) {
    this.auth.currentUser$.subscribe(user => this.user = user);
// { id, name, role }
  }

  logout() {
    this.auth.logout();
  }
}
