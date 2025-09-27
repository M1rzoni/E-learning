import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'predavač' | 'student';
  active: boolean;
  created_at: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-menagement.html',
  styleUrls: ['./user-menagement.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  searchTerm: string = '';
  isLoading = false;
  currentUser: any;
  
  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'student' as 'admin' | 'predavač' | 'student'
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.checkAdminAccess();
    this.loadUsers();
  }

  checkAdminAccess() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentUser = JSON.parse(userData);
    if (this.currentUser.role !== 'admin') {
      alert('Samo administratori mogu pristupiti ovoj stranici!');
      this.router.navigate(['/home']);
      return;
    }
  }

  loadUsers() {
    this.isLoading = true;
    this.http.get<any>('http://localhost/eucenje-backend/get_users.php')
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users = response.users;
            this.filterUsers();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
          alert('Greška pri učitavanju korisnika');
        }
      });
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  createUser() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      alert('Sva polja su obavezna');
      return;
    }

    if (this.newUser.password.length < 6) {
      alert('Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    this.http.post<any>('http://localhost/eucenje-backend/create_user.php', this.newUser)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Korisnik uspješno kreiran!');
            this.loadUsers();
            this.newUser = { name: '', email: '', password: '', role: 'student' };
          } else {
            alert(response.message || 'Greška pri kreiranju korisnika');
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
          alert('Greška pri kreiranju korisnika');
        }
      });
  }

  updateUser(user: User) {
    this.http.put<any>('http://localhost/eucenje-backend/update_user.php', user)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Korisnik uspješno ažuriran!');
            this.loadUsers();
            this.selectedUser = null;
          } else {
            alert(response.message || 'Greška pri ažuriranju korisnika');
          }
        },
        error: (error) => {
          console.error('Error updating user:', error);
          alert('Greška pri ažuriranju korisnika');
        }
      });
  }

  toggleUserStatus(user: User) {
    const action = user.active ? 'deaktivirati' : 'aktivirati';
    if (confirm(`Da li ste sigurni da želite ${action} korisnika ${user.name}?`)) {
      const updatedUser = { ...user, active: !user.active };
      
      this.http.put<any>('http://localhost/eucenje-backend/update_user.php', updatedUser)
        .subscribe({
          next: (response) => {
            if (response.success) {
              alert(`Korisnik uspješno ${user.active ? 'deaktiviran' : 'aktiviran'}!`);
              this.loadUsers();
            } else {
              alert(response.message || 'Greška pri promjeni statusa korisnika');
            }
          },
          error: (error) => {
            console.error('Error updating user status:', error);
            alert('Greška pri promjeni statusa korisnika');
          }
        });
    }
  }

  selectUser(user: User) {
    this.selectedUser = { ...user };
  }

  cancelEdit() {
    this.selectedUser = null;
  }

  // Sprečava adminu da deaktivira samog sebe
  canDeactivate(user: User): boolean {
    return user.id !== this.currentUser.id;
  }
}