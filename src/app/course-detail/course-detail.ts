import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WalletService } from '../wallet';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css']
})
export class CourseDetailComponent implements OnInit {
  coursePrice: number = 0;
  course: any;
  currentUser: any;
  userBalance: number = 0;
  isPurchased: boolean = false;
  isSaved: boolean = false;
  isLoading: boolean = true;
  isPurchasing: boolean = false;
  isAdmin: boolean = false; 
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private walletService: WalletService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Course ID:', id);
    
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.isAdmin = this.currentUser.role === 'admin'; 
      this.getUserBalance();
      this.checkIfPurchased();
      this.checkIfSaved();
    }

    this.http.get(`http://localhost/eucenje-backend/get-course.php?id=${id}`)
      .subscribe({
        next: (data: any) => {
          this.course = data;
          this.coursePrice = parseFloat(data.price) || 0;
        
          console.log('=== DETALJNI DEBUG ===');
          console.log('Cijeli odgovor:', data);
          console.log('Sva polja kursa:', Object.keys(data));
          console.log('Image property:', data.image);
          console.log('Has image property:', data.hasOwnProperty('image'));
          console.log('Image URL (getImageUrl):', this.getImageUrl(data.image));
          console.log('==============');
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Greška pri učitavanju kursa:', error);
          this.isLoading = false;
        }
      });
  }

  getImageUrl(imageName: string): string {
    if (!imageName || imageName === 'default-course-image.png' || imageName === 'default-course-image.jpg') {
      return 'http://localhost/eucenje-backend/uploads/courses/default-course-image.png';
    }
    
    if (imageName.startsWith('http')) {
      return imageName;
    }
    
    return 'http://localhost/eucenje-backend/uploads/courses/' + imageName;
  }

  handleImageError(event: any) {
    event.target.src = 'http://localhost/eucenje-backend/uploads/courses/default-course-image.png';
  }

  getUserBalance() {
    this.walletService.getBalance(this.currentUser.id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.userBalance = response.balance;
        }
      },
      error: (error: any) => {
        console.error('Greška pri dobijanju balansa:', error);
      }
    });
  }

  checkIfPurchased() {
    const courseId = this.route.snapshot.paramMap.get('id');
    this.http.get(`http://localhost/eucenje-backend/check-purchase.php?user_id=${this.currentUser.id}&course_id=${courseId}`)
      .subscribe({
        next: (response: any) => {
          this.isPurchased = response.purchased;
        },
        error: (error) => {
          console.error('Greška pri proveri kupovine:', error);
        }
      });
  }

  checkIfSaved() {
    const courseId = this.route.snapshot.paramMap.get('id');
    this.http.get(`http://localhost/eucenje-backend/check-saved.php?user_id=${this.currentUser.id}&course_id=${courseId}`)
      .subscribe({
        next: (response: any) => {
          this.isSaved = response.saved;
        },
        error: (error) => {
          console.error('Greška pri proveri sačuvanih:', error);
        }
      });
  }

  purchaseCourse() {
    if (!this.currentUser) {
      alert('Morate biti prijavljeni da biste kupili kurs');
      return;
    }

    if (this.coursePrice > 0 && this.userBalance < this.coursePrice) {
      alert('Nemate dovoljno sredstava na računu!');
      return;
    }

    this.isPurchasing = true;
    const courseId = this.route.snapshot.paramMap.get('id');

    this.walletService.purchaseCourse(this.currentUser.id, parseInt(courseId!))
      .subscribe({
        next: (response: any) => {
          this.isPurchasing = false;
          if (response.success) {
            alert('Kurs uspešno kupljen! ' + (response.email_sent ? 'Email potvrda je poslata.' : ''));
            this.isPurchased = true;
            this.getUserBalance(); 
          } else {
            alert('Greška: ' + response.message);
          }
        },
        error: (error: any) => {
          this.isPurchasing = false;
          alert('Greška pri kupovini kursa');
          console.error('Purchase error:', error);
        }
      });
  }

  quickAddFunds(amount: number) {
    if (!this.currentUser) return;
    
    this.isLoading = true;
    this.walletService.addFunds(this.currentUser.id, amount)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.success) {
            alert(`Uspešno ste dodali ${amount}€ na novčanik!`);
            this.getUserBalance(); 
          } else {
            alert('Greška: ' + response.message);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          alert('Greška pri dodavanju sredstava');
          console.error('Add funds error:', error);
        }
      });
  }

  toggleSaveCourse() {
    if (!this.currentUser) {
      alert('Morate biti prijavljeni da biste sačuvali kurs');
      return;
    }

    const courseId = this.route.snapshot.paramMap.get('id');

    if (this.isSaved) {
      this.walletService.removeSavedCourse(this.currentUser.id, parseInt(courseId!))
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              this.isSaved = false;
              alert('Kurs uklonjen iz sačuvanih');
            }
          },
          error: (error: any) => {
            alert('Greška pri uklanjanju kursa');
            console.error('Remove saved error:', error);
          }
        });
    } else {
      this.walletService.saveCourse(this.currentUser.id, parseInt(courseId!))
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              this.isSaved = true;
              alert('Kurs sačuvan za kasnije');
            }
          },
          error: (error: any) => {
            alert('Greška pri čuvanju kursa');
            console.error('Save course error:', error);
          }
        });
    }
  }

  editCourse() {
    if (this.isAdmin) {
      this.router.navigate(['/edit-course', this.course.id]);
    }
  }

  deleteCourse() {
    if (this.isAdmin && confirm('Jeste li sigurni da želite obrisati ovaj kurs?')) {
      this.http.post('http://localhost/eucenje-backend/delete-course.php', { id: this.course.id })
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              alert('Kurs uspešno obrisan');
              this.router.navigate(['/courses']);
            }
          },
          error: (error) => {
            alert('Greška pri brisanju kursa');
            console.error('Delete error:', error);
          }
        });
    }
  }

  addFunds(amount: number) {
    this.isLoading = true;
    this.walletService.addFunds(this.currentUser.id, amount)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.success) {
            alert('Sredstva uspešno dodata!');
            this.getUserBalance(); 
          } else {
            alert('Greška: ' + response.message);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          alert('Greška pri dodavanju sredstava');
          console.error('Add funds error:', error);
        }
      });
  }

openCourseVideo() {
  const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; 
  
  const categoryVideos: { [key: string]: string } = {
    'Frontend': 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 
    'Backend': 'https://www.youtube.com/watch?v=WLQDpY7lOLg', 
    'Dizajn': 'https://www.youtube.com/watch?v=_a5j7KoflTs', 
    'Marketing': 'https://www.youtube.com/watch?v=aFwZgth790Q', 
    'Data Science': 'https://www.youtube.com/watch?v=ua-CiDNNj30', 
    'Mobile': 'https://www.youtube.com/watch?v=0-S5a0eXPoc', 
  };
  
  const videoUrl = this.course?.category && categoryVideos[this.course.category] 
    ? categoryVideos[this.course.category] 
    : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; 
  
  window.open(videoUrl, '_blank');
}

openCourseVideoSimple() {
  const defaultVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  window.open(defaultVideoUrl, '_blank');
}

  goToWallet() {
    this.router.navigate(['/wallet']);
  }
}