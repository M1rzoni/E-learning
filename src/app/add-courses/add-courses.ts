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
})
export class AddCourseComponent {
  title = '';
  description = '';
  message = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  addCourse() {
    this.isLoading = true;
    this.message = '';
    
    const course = {
      title: this.title,
      description: this.description
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
          this.title = '';
          this.description = '';
        } else {
          this.message = '❌ Greška: ' + response.message;
        }
      });
  }
}