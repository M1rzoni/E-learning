import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost/eucenje-backend';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('HTTP Error:', error);
    let errorMessage = 'Došlo je do greške';
    
    if (error.error instanceof ErrorEvent) {
      
      errorMessage = `Greška: ${error.error.message}`;
    } else {
   
      errorMessage = `Server vratio grešku: ${error.status} - ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getBalance(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/wallet.php?user_id=${userId}`)
      .pipe(catchError(this.handleError));
  }

  addFunds(userId: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet.php`, {
      user_id: userId,
      amount: amount
    }).pipe(catchError(this.handleError));
  }

  purchaseCourse(userId: number, courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase.php`, {
      user_id: userId,
      course_id: courseId
    }).pipe(catchError(this.handleError));
  }

  getSavedCourses(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/saved-courses.php?user_id=${userId}`)
      .pipe(catchError(this.handleError));
  }

  saveCourse(userId: number, courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/saved-courses.php`, {
      user_id: userId,
      course_id: courseId
    }).pipe(catchError(this.handleError));
  }

  removeSavedCourse(userId: number, courseId: number): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/saved-courses.php`, {
      body: {
        user_id: userId,
        course_id: courseId
      }
    }).pipe(catchError(this.handleError));
  }

  getPurchaseHistory(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/purchase-history.php?user_id=${userId}`)
      .pipe(catchError(this.handleError));
  }
}