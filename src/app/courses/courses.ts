import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-courses-list',
  templateUrl: './courses.html',
  styleUrls: ['./courses.css'],
  imports: [CommonModule, FormsModule, RouterLink],
})
export class CoursesListComponent implements OnInit {
  courses: any[] = [];
  selectedCourse: any = null;
  isUpdating = false;
  expandedCategories: Set<string> = new Set();
  currentUser: any;
  isAdmin: boolean = false; 

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.isAdmin = this.currentUser.role === 'admin'; 
    }
    
    this.loadCourses();
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Frontend': '💻',
      'Backend': '⚙️',
      'Dizajn': '🎨',
      'Marketing': '📈',
      'Data Science': '📊',
      'Mobile': '📱'
    };
    return icons[category] || '📚';
  }


  toggleCategory(category: string) {
    if (this.expandedCategories.has(category)) {
      this.expandedCategories.delete(category);
    } else {
      this.expandedCategories.add(category);
    }
  }

  isCategoryExpanded(category: string): boolean {
    return this.expandedCategories.has(category);
  }

  handleImageError(event: any) {
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    if (parent) {
      const placeholder = parent.querySelector('.course-image-placeholder');
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
    }
  }

  editCourse(course: any) {
    this.selectedCourse = { ...course };
  }
  
  uploadImage(event: any, courseId: number) {
    const file = event.target.files[0];
    if (!file) return;

    
    if (!file.type.startsWith('image/')) {
      alert('Molimo izaberite isključivo sliku.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { //5mb je limit
      alert('Slika je prevelika. Maksimalna veličina je 5MB.');
      return;
    }

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
        console.error('Upload error:', err);
      }
    );
  }

  getGroupedCourses() {
    const grouped: { [key: string]: any[] } = {};

    this.courses.forEach(course => {
      const category = course.category || 'Nekategorisano';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(course);
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
          if (this.expandedCategories.size === 0) {
            Object.keys(this.getGroupedCourses()).forEach(category => {
              this.expandedCategories.add(category);
            });
          }
        },
        error: (error) => {
          console.error('Greška pri učitavanju kurseva:', error);
        }
      });
  }

  confirmDelete(id: number) {
    if (confirm('Jesi li siguran da želiš obrisati ovaj kurs? Ova akcija je nepovratna.')) {
      this.deleteCourse(id);
    }
  }

  canEditCourse(): boolean {
    return this.isAdmin;
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