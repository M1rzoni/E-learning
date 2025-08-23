import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-courses-list',
  templateUrl: './courses.html',
   styleUrls: ['./courses.css'],
  imports: [CommonModule, HttpClientModule, FormsModule, RouterLink,],
})
export class CoursesListComponent implements OnInit {
  courses: any[] = [];
  selectedCourse: any = null;
  isUpdating = false; 

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCourses();
  }

  editCourse(course: any) {
    this.selectedCourse = { ...course }; 
  }
  
  uploadImage(event: any, courseId: number) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('id', courseId.toString());

    this.http.post<any>('http://localhost/eucenje-backend/upload-image.php', formData).subscribe(
      res => {
        alert('Slika uspješno uploadovana!');
        this.loadCourses(); 
      },
      err => {
        alert('Greška pri uploadu slike.');
      }
    );
  }

  // Grupisanje kurseva po kategoriji
  getGroupedCourses() {
    const grouped: { [key: string]: any[] } = {};

    this.courses.forEach(course => {
      if (!grouped[course.category]) {
        grouped[course.category] = [];
      }
      grouped[course.category].push(course);
    });

    return grouped;
  }

  updateCourse() {
    if (!this.selectedCourse || this.isUpdating) return;
    
    this.isUpdating = true;
    
    this.http.post('http://localhost/eucenje-backend/update-course.php', this.selectedCourse)
      .subscribe({
        next: (response) => {
          const courseIndex = this.courses.findIndex(c => c.id === this.selectedCourse.id);
          if (courseIndex !== -1) {
            this.courses[courseIndex] = { ...this.selectedCourse };
          }
          
          alert('Kurs je ažuriran.');
          this.selectedCourse = null;
          this.isUpdating = false;
          this.loadCourses(); 
        },
        error: (error) => {
          alert('Greška pri ažuriranju kursa.');
          console.error('Update error:', error);
          this.isUpdating = false;
        }
      });
  }

  loadCourses() {
    this.http.get<any[]>('http://localhost/eucenje-backend/courses.php')
      .subscribe({
        next: (data) => {
          this.courses = data;
        },
        error: (error) => {
          console.error('Greška pri učitavanju kurseva:', error);
        }
      });
  }

  confirmDelete(id: number) {
    if (confirm('Jesi li siguran da želiš obrisati ovaj kurs?')) {
      this.deleteCourse(id);
    }
  }

  deleteCourse(id: number) {
    this.http.post('http://localhost/eucenje-backend/delete-course.php', { id })
      .subscribe({
        next: (response) => {
          alert('Kurs obrisan.');
          this.loadCourses(); 
        },
        error: (error) => {
          alert('Greška pri brisanju kursa.');
          console.error(error);
        }
      });
  }
}
