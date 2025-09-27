import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { CoursesListComponent } from './courses/courses';
import { AddCourseComponent } from './add-courses/add-courses';
import { CourseDetailComponent } from './course-detail/course-detail';
import { HomeComponent } from './home/home'; 
import { WalletComponent } from './wallet/wallet';
import { UserManagementComponent } from './user-menagement/user-menagement';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {path: 'admin/users', component: UserManagementComponent, canActivate: [AuthGuard]},
  { path: 'home', component: HomeComponent }, 
  { path: 'courses', component: CoursesListComponent },
  { path: 'add-courses', component: AddCourseComponent },
  { path: 'course/:id', component: CourseDetailComponent },
    { path: 'wallet', component: WalletComponent },
  { path: '**', redirectTo: '/login' } 
];