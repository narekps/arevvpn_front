import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {Observable, Subject} from 'rxjs';

export interface CaptchaConfig {
  siteKey: string;
  containerId: string;
  callback?: (token: string) => void;
  invisible?: boolean;
  hideShield?: boolean;
  shieldPosition?: 'top-left' | 'center-left' | 'bottom-left' | 'top-right' | 'center-right' | 'bottom-right';
}

@Injectable({
  providedIn: 'root'
})
export class YandexCaptchaService {
  private readonly CAPTCHA_SCRIPT_URL = 'https://smartcaptcha.cloud.yandex.ru/captcha.js';
  private renderer: Renderer2;
  private scriptLoaded = false;
  private scriptLoading = false;
  private loadSubject = new Subject<boolean>();
  // Храним ID виджетов для каждого контейнера
  private widgetIds = new Map<string, string>();
  private static nextId = 0;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Генерирует уникальный ID для контейнера капчи
   */
  generateUniqueId(): string {
    return `captcha-container-${YandexCaptchaService.nextId++}`;
  }

  /**
   * Загружает скрипт Яндекс Капчи, если он еще не загружен
   */
  loadScript(): Observable<boolean> {
    // Если скрипт уже загружен
    if (this.scriptLoaded) {
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    // Если скрипт уже загружается
    if (this.scriptLoading) {
      return this.loadSubject.asObservable();
    }

    // Проверяем, может быть скрипт уже загружен из index.html
    if (typeof (window as any).smartCaptcha !== 'undefined') {
      this.scriptLoaded = true;
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    // Загружаем скрипт
    this.scriptLoading = true;

    return new Observable(observer => {
      const script = this.renderer.createElement('script');
      script.src = this.CAPTCHA_SCRIPT_URL;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        observer.next(true);
        observer.complete();
        this.loadSubject.next(true);
        this.loadSubject.complete();
      };

      script.onerror = () => {
        this.scriptLoading = false;
        const error = new Error('Failed to load Yandex SmartCaptcha script');
        observer.error(error);
        this.loadSubject.error(error);
      };

      this.renderer.appendChild(document.head, script);

      // Таймаут на случай, если скрипт не загрузится
      setTimeout(() => {
        if (!this.scriptLoaded) {
          this.scriptLoading = false;
          const error = new Error('Yandex SmartCaptcha script loading timeout');
          observer.error(error);
        }
      }, 10000);
    });
  }

  /**
   * Рендерит капчу в указанном контейнере
   */
  render(config: CaptchaConfig): Observable<void> {
    return new Observable(observer => {
      this.loadScript().subscribe({
        next: () => {
          try {
            const container = document.getElementById(config.containerId);
            if (!container) {
              observer.error(new Error(`Container with id "${config.containerId}" not found`));
              return;
            }

            if (typeof (window as any).smartCaptcha === 'undefined') {
              observer.error(new Error('smartCaptcha is not defined'));
              return;
            }

            // Очищаем контейнер перед рендерингом
            container.innerHTML = '';

            const captchaOptions: any = {
              sitekey: config.siteKey,
              callback: (token: string) => {
                if (config.callback) {
                  config.callback(token);
                }
              }
            };

            // Добавляем опциональные параметры
            if (config.invisible !== undefined) {
              captchaOptions.invisible = config.invisible;
            }
            if (config.hideShield !== undefined) {
              captchaOptions.hideShield = config.hideShield;
            }
            if (config.shieldPosition) {
              captchaOptions.shieldPosition = config.shieldPosition;
            }

            // Сохраняем ID виджета, возвращаемый методом render
            const widgetId = (window as any).smartCaptcha.render(container, captchaOptions);
            this.widgetIds.set(config.containerId, widgetId);

            observer.next();
          } catch (error) {
            observer.error(error);
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Сбрасывает капчу
   */
  reset(containerId: string): void {
    const widgetId = this.widgetIds.get(containerId);
    if (widgetId && typeof (window as any).smartCaptcha !== 'undefined') {
      try {
        (window as any).smartCaptcha.reset(widgetId);
      } catch (error) {
        console.error('Error resetting captcha:', error);
      }
    } else {
      console.warn(`Widget ID not found for container: ${containerId}`);
    }
  }

  /**
   * Уничтожает капчу
   */
  destroy(containerId: string): void {
    const widgetId = this.widgetIds.get(containerId);
    if (widgetId && typeof (window as any).smartCaptcha !== 'undefined') {
      try {
        (window as any).smartCaptcha.destroy(widgetId);
        // Удаляем ID виджета из Map после уничтожения
        this.widgetIds.delete(containerId);
      } catch (error) {
        console.error('Error destroying captcha:', error);
      }
    } else {
      console.warn(`Widget ID not found for container: ${containerId}`);
    }
  }

  /**
   * Получает токен капчи
   */
  getResponse(containerId: string): string | null {
    const widgetId = this.widgetIds.get(containerId);
    if (widgetId && typeof (window as any).smartCaptcha !== 'undefined') {
      try {
        return (window as any).smartCaptcha.getResponse(widgetId);
      } catch (error) {
        console.error('Error getting captcha response:', error);
        return null;
      }
    }
    return null;
  }
}
