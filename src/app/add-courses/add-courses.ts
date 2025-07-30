import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private http: HttpClient) {}

  addCourse() {
    const course = {
      title: this.title,
      description: this.description
    };

    this.http.post<any>('http://localhost/eucenje-backend/add-course.php', course)
      .subscribe(response => {
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
