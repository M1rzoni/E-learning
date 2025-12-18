import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  courses: any[] = [];
  filteredCourses: any[] = [];
  featuredCourses: any[] = [];
  categories = [
    { name: 'Frontend', icon: '💻' },
    { name: 'Backend', icon: '⚙️' },
    { name: 'Dizajn', icon: '🎨' },
    { name: 'Marketing', icon: '📈' }
  ];
  currentUser: any;
  
  searchTerm: string = '';
  selectedCategory: string = '';
  sortOption: string = 'newest';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadCourses();
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  loadCourses() {
    this.http.get<any[]>('http://localhost/eucenje-backend/courses.php')
      .subscribe({
        next: (data) => {
          this.courses = data;
          this.filteredCourses = [...this.courses];
          this.featuredCourses = data.slice(0, 6);
        },
        error: (error) => {
          console.error('Greška pri učitavanju kurseva:', error);
        }
      });
  }

  filterCourses() {
    let filtered = this.courses;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(term) || 
        course.description.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedCategory) {
      filtered = filtered.filter(course => 
        course.category === this.selectedCategory
      );
    }
    
    switch(this.sortOption) {
      case 'newest':
        filtered = filtered.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        filtered = filtered.sort((a, b) => a.id - b.id);
        break;
      case 'title':
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    this.filteredCourses = filtered;
    this.featuredCourses = this.filteredCourses.slice(0, 6);
  }

  getImageUrl(imageName: string): string {
    if (!imageName || imageName === 'default-course-image.png' || imageName === 'default-course-image.jpg') {
      return 'http://localhost/eucenje-backend/uploads/courses/default-course-image.png';
    }
    
    return 'http://localhost/eucenje-backend/uploads/courses/' + imageName;
  }

  handleImageError(event: any): void {
    const img = event.target;
    img.style.display = 'none';
    
    const placeholder = img.nextElementSibling;
    if (placeholder && placeholder.classList.contains('course-image-placeholder')) {
      placeholder.style.display = 'block';
    }
  }

  getCoursesByCategory(category: string) {
    return this.courses.filter(course => course.category === category).slice(0, 4);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.currentUser && this.currentUser.role === 'admin';
  }
}