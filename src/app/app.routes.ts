import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import {CoursesListComponent } from './courses/courses';
import { AddCourseComponent } from './add-courses/add-courses';
import { CourseDetailComponent } from './course-detail/course-detail';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'courses', component: CoursesListComponent},
    {path: 'add-courses', component: AddCourseComponent}, 
    {path: 'course/:id', component: CourseDetailComponent},
    {path: '', redirectTo: '/login', pathMatch: 'full'}

];
