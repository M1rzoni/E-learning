import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-courses.html',
  styleUrls: ['./add-courses.css']
})
export class AddCourseComponent {
  title = '';
  description = '';
  category = '';
  level = 'Početni';
  price: number | null = null;
  image: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  message = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
  
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
        this.message = '❌ Molimo odaberite JPG, JPEG ili PNG sliku.';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.message = '❌ Slika je prevelika. Maksimalna veličina je 5MB.';
        return;
      }

      this.image = file;

     
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
      this.message = '';
    }
  }

  removeImage() {
    this.image = null;
    this.imagePreview = null;
  }

 addCourse() {
    if (!this.title || !this.description || !this.category) {
        this.message = '❌ Molimo popunite sva obavezna polja.';
        return;
    }

    this.isLoading = true;
    this.message = '';

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('category', this.category);
    formData.append('level', this.level);
    formData.append('price', this.price ? this.price.toString() : '0');

    if (this.image) {
        formData.append('image', this.image, this.image.name);
    }

    this.http.post('http://localhost/eucenje-backend/add-course-with-image.php', 
      formData, 
      { responseType: 'text' }  
    )
    .subscribe({
        next: (rawResponse: string) => {
            this.isLoading = false;
            console.log('✅ RAW RESPONSE:', rawResponse);
            
            try {
                const response = JSON.parse(rawResponse);
                console.log('✅ Parsed response:', response);
                
                if (response.success) {
                    this.message = '✅ ' + response.message;
                    setTimeout(() => this.clearForm(), 2000);
                } else {
                    this.message = '❌ ' + response.message;
                }
            } catch (e) {
                console.error('❌ Failed to parse JSON:', e);
                console.error('❌ Raw response was:', rawResponse);
                this.message = '❌ Server returned invalid JSON: ' + rawResponse.substring(0, 100);
            }
        },
        error: (error) => {
            this.isLoading = false;
            console.error('❌ HTTP Error:', error);
            console.error('❌ Error status:', error.status);
            console.error('❌ Error message:', error.message);
            
            if (error.status === 0) {
                this.message = '❌ Cannot connect to server. Is XAMPP running?';
            } else if (error.error instanceof ErrorEvent) {
                this.message = '❌ Client error: ' + error.error.message;
            } else {
                this.message = `❌ Server error ${error.status}: ${error.message}`;
            }
        }
    });
}

  clearForm() {
    this.title = '';
    this.description = '';
    this.category = '';
    this.level = 'Početni';
    this.price = null;
    this.image = null;
    this.imagePreview = null;
    this.message = '';
    
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}