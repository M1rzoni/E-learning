import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WalletService } from '../wallet';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.css']
})
export class WalletComponent implements OnInit {
  currentUser: any;
  balance: number = 0;
  transactions: any[] = [];
  isLoading: boolean = false;
  addAmount: number = 0;
  errorMessage: string = '';

  constructor(private walletService: WalletService) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.loadWalletData();
    }
  }

  loadWalletData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.walletService.getBalance(this.currentUser.id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.balance = response.balance;
        } else {
          this.errorMessage = response.message || 'Greška pri učitavanju balansa';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju balansa:', error);
        this.errorMessage = 'Greška u komunikaciji sa serverom';
        this.isLoading = false;
      }
    });

    this.walletService.getPurchaseHistory(this.currentUser.id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.transactions = response.transactions;
        }
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju transakcija:', error);
      }
    });
  }

  addFunds() {
    if (this.addAmount <= 0) {
      alert('Molimo unesite validan iznos');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.walletService.addFunds(this.currentUser.id, this.addAmount).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert(`Uspešno ste dodali ${this.addAmount}€ na novčanik!`);
          this.addAmount = 0;
          this.loadWalletData(); // Osveži podatke
        } else {
          this.errorMessage = response.message || 'Greška pri dodavanju sredstava';
          alert('Greška: ' + response.message);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Greška u komunikaciji sa serverom';
        alert('Greška pri dodavanju sredstava: ' + error.message);
        console.error('Add funds error:', error);
        this.isLoading = false;
      }
    });
  }

  getTransactionType(type: string): string {
    const types: { [key: string]: string } = {
      'purchase': 'Kupovina kursa',
      'deposit': 'Dodavanje sredstava',
      'refund': 'Povrat novca'
    };
    return types[type] || type;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}