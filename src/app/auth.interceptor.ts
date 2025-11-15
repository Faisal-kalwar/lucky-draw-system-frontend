import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    
    console.log('🌐 Request URL:', req.url);
    console.log('🔍 Token from localStorage:', token);
    console.log('📋 Token length:', token?.length);
    console.log('🔠 Token starts with:', token?.substring(0, 10));
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Request headers:', req.headers.get('Authorization'));
    }
  }
  
  return next(req);
};