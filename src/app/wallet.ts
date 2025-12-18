import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost/eucenje-backend';

  constructor(private http: HttpClient) {}

  getBalance(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/wallet.php?user_id=${userId}`);
  }

  addFunds(userId: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet.php`, {
      user_id: userId,
      amount: amount
    });
  }

  purchaseCourse(userId: number, courseId: number): Observable<any> {
    // KORISTI NOVI ENDPOINT
    return this.http.post(`${this.apiUrl}/purchase-with-wallet.php`, {
      user_id: userId,
      course_id: courseId
    });
  }

  getPurchaseHistory(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-transactions.php?user_id=${userId}`);
  }

  saveCourse(userId: number, courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/save-course.php`, {
      user_id: userId,
      course_id: courseId
    });
  }

  removeSavedCourse(userId: number, courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/remove-saved-course.php`, {
      user_id: userId,
      course_id: courseId
    });
  }
}