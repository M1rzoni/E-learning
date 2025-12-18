import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-courses.html',
  styleUrls: ['./my-courses.css']
})
export class MyCoursesComponent implements OnInit {
  currentUser: any;
  purchasedCourses: any[] = [];
  savedCourses: any[] = [];
  activeTab: 'purchased' | 'saved' = 'purchased';
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.loadCourses();
    }
  }

  switchTab(tab: 'purchased' | 'saved') {
    this.activeTab = tab;
  }

  loadCourses() {
    this.isLoading = true;
    this.loadPurchasedCourses();
    this.loadSavedCourses();
  }

  loadPurchasedCourses() {
    this.http.get<any>(`http://localhost/eucenje-backend/get-purchased-courses.php?user_id=${this.currentUser.id}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.purchasedCourses = response.courses || [];
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading purchased courses:', error);
          this.isLoading = false;
        }
      });
  }

  loadSavedCourses() {
    this.http.get<any>(`http://localhost/eucenje-backend/save-courses.php?user_id=${this.currentUser.id}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.savedCourses = response.courses || [];
          }
        },
        error: (error) => {
          console.error('Error loading saved courses:', error);
        }
      });
  }

  removeSavedCourse(courseId: number) {
    if (!confirm('Da li želite ukloniti ovaj kurs iz sačuvanih?')) return;

    this.http.post('http://localhost/eucenje-backend/remove-saved-course.php', {
      user_id: this.currentUser.id,
      course_id: courseId
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('Kurs uklonjen iz sačuvanih');
          this.loadSavedCourses();
        }
      },
      error: (error) => {
        alert('Greška pri uklanjanju kursa');
        console.error('Remove error:', error);
      }
    });
  }

  getImageUrl(imageName: string): string {
    if (!imageName || imageName === 'default-course-image.png' || imageName === 'default-course-image.jpg') {
      return 'http://localhost/eucenje-backend/uploads/courses/default-course-image.png';
    }
    return 'http://localhost/eucenje-backend/uploads/courses/' + imageName;
  }

  handleImageError(event: any) {
    event.target.src = 'http://localhost/eucenje-backend/uploads/courses/default-course-image.png';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'danas';
    if (diffDays === 1) return 'juče';
    if (diffDays < 7) return `prije ${diffDays} dana`;
    if (diffDays < 30) return `prije ${Math.floor(diffDays / 7)} sedmica`;
    return date.toLocaleDateString('sr-RS');
  }
}