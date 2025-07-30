import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ ovo mora postojati
  templateUrl: './login.html',
})


export class LoginComponent {
  email = '';
  password = '';
  error = '';
  success = false;

  constructor(private http: HttpClient) {}

  login() {
    const body = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost/eucenje-backend/login.php', body)
      .subscribe(response => {
        if (response.success) {
          this.success = true;
          this.error = '';
        } else {
          this.error = response.message;
          this.success = false;
        }
      }, error => {
        this.error = 'Greška u komunikaciji sa serverom';
        this.success = false;
      });
  }
}
