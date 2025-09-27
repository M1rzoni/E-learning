// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      // Provjera da li je administrator
      if (userData.role === 'admin') {
        return true;
      }
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}