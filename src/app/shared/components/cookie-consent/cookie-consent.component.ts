import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-consent',
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss']
})
export class CookieConsentComponent implements OnInit {
  showBanner = false;

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      if (!localStorage.getItem('cookie_consent')) {
        this.showBanner = true;
      }
    }
  }

  acceptCookies(): void {
    localStorage.setItem('cookie_consent', 'true');
    this.showBanner = false;
  }
}
