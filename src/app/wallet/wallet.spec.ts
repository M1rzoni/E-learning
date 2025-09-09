import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wallet } from './wallet';

describe('Wallet', () => {
  let component: Wallet;
  let fixture: ComponentFixture<Wallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wallet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wallet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
