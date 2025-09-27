import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
 email = '';
  password = '';
  name = '';
  role = 'student'; 
  error = '';
  success = '';
  isLoginMode = true;
  isLoading = false;

  constructor(private http: HttpClient, private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
    this.success = '';
    this.email = '';
    this.password = '';
    this.name = '';
    this.role = 'student'; 
  }

  login() {
    this.isLoading = true;
    this.error = '';
    this.success = '';

    const body = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost/eucenje-backend/login.php', body)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.success = response.message;
            this.error = '';
            
            localStorage.setItem('currentUser', JSON.stringify(response.user));


          if (response.user.role === 'admin') {
              this.router.navigate(['/admin/users']);
            } else {
              this.router.navigate(['/home']);
            }
          } else {
            this.error = response.message || 'Pogrešni podaci za prijavu';
            this.success = '';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Login error:', error);
          
          if (error.status === 0) {
            this.error = 'Server nije dostupan. Provjerite da li je PHP server pokrenut.';
          } else if (error.error && error.error.message) {
            this.error = error.error.message;
          } else if (error.status === 404) {
            this.error = 'Login endpoint nije pronađen. Provjerite URL.';
          } else if (error.status === 401) {
            this.error = 'Pogrešni pristupni podaci';
          } else {
            this.error = 'Greška u komunikaciji sa serverom: ' + error.statusText;
          }
          this.success = '';
        }
      });
  }

  register() {
    this.isLoading = true;
    this.error = '';
    this.success = '';

    // Validacija
    if (!this.name || !this.email || !this.password) {
      this.error = 'Sva polja su obavezna';
      this.isLoading = false;
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Lozinka mora imati najmanje 6 karaktera';
      this.isLoading = false;
      return;
    }

    const body = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.http.post<any>('http://localhost/eucenje-backend/register.php', body)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.success = response.message;
            this.error = '';
            this.login();
          } else {
            this.error = response.message || 'Greška pri registraciji';
            this.success = '';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          
          if (error.status === 0) {
            this.error = 'Server nije dostupan. Provjerite da li je PHP server pokrenut.';
          } else if (error.error && error.error.message) {
            this.error = error.error.message;
          } else if (error.status === 409) {
            this.error = 'Email već postoji';
          } else if (error.status === 400) {
            this.error = 'Nevažeći podaci';
          } else {
            this.error = 'Greška u komunikaciji sa serverom: ' + error.statusText;
          }
          this.success = '';
        }
      });
  }

  onSubmit() {
    if (this.isLoginMode) {
      this.login();
    } else {
      this.register();
    }
  }
}