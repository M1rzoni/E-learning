import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css']
})
export class CourseDetailComponent implements OnInit {
  course: any;
  isLoading: boolean = true;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`http://localhost/eucenje-backend/get-course.php?id=${id}`)
      .subscribe({
        next: (data) => {
          this.course = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Greška pri učitavanju kursa:', error);
          this.isLoading = false;
        }
      });
  }
}