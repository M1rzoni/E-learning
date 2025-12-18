import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-courses-list',
  templateUrl: './courses.html',
  styleUrls: ['./courses.css'],
  imports: [CommonModule, FormsModule, RouterLink],
})
export class CoursesListComponent implements OnInit, OnDestroy {
  courses: any[] = [];
  selectedCourse: any = null;
  isUpdating = false;
  isLoading = false;
  expandedCategories: Set<string> = new Set();
  currentUser: any;
  isAdmin: boolean = false;
  private groupedCoursesCache: { [key: string]: any[] } = {};
  private httpSubscription?: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('🎯 CoursesListComponent init start');
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.isAdmin = this.currentUser.role === 'admin'; 
    }
    
    this.loadCourses();
  }

  ngOnDestroy() {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
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

  getImageUrl(imageName: string): string {
    if (!imageName || imageName === 'default-course-image.png' || imageName === 'default-course-image.jpg') {
      return 'http://localhost/eucenje-backend/uploads/courses/default-course-image.png';
    }
    
    return 'http://localhost/eucenje-backend/uploads/courses/' + imageName;
  }

  handleImageError(event: any) {
    event.target.src = 'http://localhost/eucenje-backend/uploads/courses/default-course-image.png';
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

    if (file.size > 5 * 1024 * 1024) {
      alert('Slika je prevelika. Maksimalna veličina je 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('id', courseId.toString());

    this.http.post<any>('http://localhost/eucenje-backend/upload-image.php', formData).subscribe({
      next: (res) => {
        console.log('Upload success:', res);
        alert('Slika uspješno uploadovana!');
        this.loadCourses(); 
      },
      error: (err) => {
        console.error('Upload error:', err);
        alert('Greška pri uploadu slike.');
      }
    });
  }

  get groupedCourses(): { [key: string]: any[] } {
    if (Object.keys(this.groupedCoursesCache).length === 0 && this.courses.length > 0) {
      this.updateGroupedCourses();
    }
    return this.groupedCoursesCache;
  }

  get sortedCategories(): {key: string, value: any[]}[] {
    const grouped = this.groupedCourses;
    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map(key => ({ key, value: grouped[key] }));
  }

  private updateGroupedCourses(): void {
    const grouped: { [key: string]: any[] } = {};

    this.courses.forEach(course => {
      const category = course.category || 'Nekategorisano';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(course);
    });

    this.groupedCoursesCache = grouped;
  }

  updateCourse() {
    if (!this.selectedCourse || this.isUpdating) return;
    
    this.isUpdating = true;
    
    this.http.put(`http://localhost/eucenje-backend/courses.php?id=${this.selectedCourse.id}`, this.selectedCourse)
      .subscribe({
        next: (response: any) => {
          console.log('Update response:', response);
          if (response.success) {
            const courseIndex = this.courses.findIndex(c => c.id === this.selectedCourse.id);
            if (courseIndex !== -1) {
              this.courses[courseIndex] = { ...this.selectedCourse };
            }
            
            this.groupedCoursesCache = {};
            
            alert('Kurs je ažuriran.');
            this.selectedCourse = null;
            this.isUpdating = false;
            // NE POZIVAJ loadCourses() ovdje da izbjegneš reload
          } else {
            alert(response.message || 'Greška pri ažuriranju.');
            this.isUpdating = false;
          }
        },
        error: (error) => {
          console.error('Update error:', error);
          alert('Greška pri ažuriranju kursa.');
          this.isUpdating = false;
        }
      });
  }

  loadCourses() {
    if (this.isLoading) {
      console.log('⚠️ Already loading, skipping...');
      return;
    }

    console.log('📡 Loading courses...');
    this.isLoading = true;
    
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    
    this.httpSubscription = this.http.get<any[]>('http://localhost/eucenje-backend/courses.php')
      .subscribe({
        next: (data) => {
          console.log('✅ Courses loaded:', data);
          this.courses = data;
          this.isLoading = false;
          
          this.groupedCoursesCache = {};
          
          if (this.expandedCategories.size === 0 && data.length > 0) {
            const categories = new Set(data.map(course => course.category || 'Nekategorisano'));
            categories.forEach(category => this.expandedCategories.add(category));
          }
        },
        error: (error) => {
          console.error('❌ Error loading courses:', error);
          this.isLoading = false;
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
          console.log('Delete response:', response);
          alert('Kurs obrisan.');
          this.groupedCoursesCache = {};
          this.loadCourses(); 
        },
        error: (error) => {
          console.error('Delete error:', error);
          alert('Greška pri brisanju kursa.');
        }
      });
  }
}