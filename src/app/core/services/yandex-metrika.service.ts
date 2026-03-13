import {Injectable, Inject, isDevMode} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare var ym: any;

@Injectable({
  providedIn: 'root'
})
export class YandexMetrikaService {
  private metrikaId = 107284389; // Ваш ID из Яндекс.Метрики
  private scriptInjected = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {}

  init() {
    // Инициализируем только в браузере и если разрешено окружением
    if (this.scriptInjected || isDevMode()) {
      return;
    }

    const script = this.document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () {
      (m[i].a = m[i].a || []).push(arguments)
    };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) {
        return;
      }
    }
    k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=${this.metrikaId}', 'ym');

    if (typeof ym === 'function') {
      ym(${this.metrikaId}, 'init', {
        ssr: true,
        webvisor: true,
        trackHash: true,
        clickmap: true,
        ecommerce: "dataLayer",
        accurateTrackBounce: true,
        trackLinks: true
      });
    }
    `;
    this.document.body.appendChild(script);

    const noscript = this.document.createElement('noscript');
    noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${this.metrikaId}" style="position:absolute; left:-9999px;" alt=""/></div>`;
    this.document.body.appendChild(noscript);

    this.scriptInjected = true;
    this.trackPageViews();
  }

  private trackPageViews() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (typeof ym === 'function') {
        ym(this.metrikaId, 'hit', event.urlAfterRedirects, {
          title: document.title,
          referer: event.url
        });
      }
    });
  }
}
