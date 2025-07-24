import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Only access localStorage if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token) {
        this.router.navigate(['/login']);
        return false;
      }

      const expectedRole = route.data['role'];
      if (expectedRole && user.role !== expectedRole) {
        this.router.navigate(['/login']);
        return false;
      }

      return true;
    }
    
    // Default behavior for server-side
    this.router.navigate(['/login']);
    return false;
  }
}