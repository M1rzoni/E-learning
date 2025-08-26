import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { CoursesListComponent } from './courses/courses';
import { AddCourseComponent } from './add-courses/add-courses';
import { CourseDetailComponent } from './course-detail/course-detail';
import { HomeComponent } from './home/home'; // Dodajte HomeComponent

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent }, // Dodajte home rutu
  { path: 'courses', component: CoursesListComponent },
  { path: 'add-courses', component: AddCourseComponent },
  { path: 'course/:id', component: CourseDetailComponent },
  { path: '**', redirectTo: '/login' } // Wildcard route za nepostojeće rute
];