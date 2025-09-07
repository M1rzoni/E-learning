import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-courses.html',
  styleUrls: ['./add-courses.css']
})
export class AddCourseComponent {
  title = '';
  description = '';
  category = '';
  level = 'Početni';
  price: number | null = null;
  message = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  addCourse() {
    this.isLoading = true;
    this.message = '';
    
    const course = {
      title: this.title,
      description: this.description,
      category: this.category,
      level: this.level,
      price: this.price
    };

    this.http.post<any>('http://localhost/eucenje-backend/add-courses.php', course)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.isLoading = false;
          if (error.status === 0) {
            this.message = '❌ Greška pri povezivanju sa serverom. Provjerite da li je server pokrenut.';
          } else {
            this.message = '❌ Greška: ' + error.message;
          }
          return throwError(() => error);
        })
      )
      .subscribe(response => {
        this.isLoading = false;
        if (response.success) {
          this.message = '✅ Kurs uspješno dodat!';
          if (!response.message.includes('Dodaj još jedan kurs')) {
            this.clearForm();
          }
        } else {
          this.message = '❌ Greška: ' + response.message;
        }
      });
  }

  clearForm() {
    this.title = '';
    this.description = '';
    this.category = '';
    this.level = 'Početni';
    this.price = null;
    this.message = '';
  }
}