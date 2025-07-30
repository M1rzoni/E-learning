import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.html'
})
export class CourseDetailComponent implements OnInit {
  course: any;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`http://localhost/eucenje-backend/get-course.php?id=${id}`)
      .subscribe(data => {
        this.course = data;
      });
  }
}
