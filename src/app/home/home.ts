import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  courses: any[] = [];
  featuredCourses: any[] = [];
  categories = [
    { name: 'Frontend', icon: '💻' },
    { name: 'Backend', icon: '⚙️' },
    { name: 'Dizajn', icon: '🎨' },
    { name: 'Marketing', icon: '📈' }
  ];
  currentUser: any;

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
          this.featuredCourses = data.slice(0, 6); 
        },
        error: (error) => {
          console.error('Greška pri učitavanju kurseva:', error);
        }
      });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getCoursesByCategory(category: string) {
    return this.courses.filter(course => course.category === category).slice(0, 4);
  }
}