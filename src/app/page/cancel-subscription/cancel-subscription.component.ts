import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subject, finalize, takeUntil} from 'rxjs';
import {MdbFormsModule} from 'mdb-angular-ui-kit/forms';
import {MdbRippleModule} from 'mdb-angular-ui-kit/ripple';
import {environment} from '../../../environments/environment';
import {SubscriptionService} from '../../services/subscription.service';
import {
  SubscriptionCancelRequest,
  SubscriptionCancelResponse
} from '../../models/subscription/subscription-data.interface';
import {YandexCaptchaService} from '../../shared/services/yandex-captcha.service';

@Component({
  selector: 'app-cancel-subscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MdbFormsModule, MdbRippleModule],
  templateUrl: './cancel-subscription.component.html',
  styleUrl: './cancel-subscription.component.scss'
})
export class CancelSubscriptionComponent implements OnInit, OnDestroy {
  protected readonly environment = environment;
  protected readonly CAPTCHA_ENABLED = environment.CAPTCHA_ENABLED;
  private readonly CAPTCHA_CONTAINER_ID = 'cancel-subscription-captcha';
  private readonly destroy$ = new Subject<void>();

  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  captchaToken: string | null = null;
  captchaLoaded = false;

  cancelForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly subscriptionService: SubscriptionService,
    private readonly captchaService: YandexCaptchaService,
  ) {}

  ngOnInit(): void {
    if (!this.CAPTCHA_ENABLED) {
      return;
    }

    // Даем DOM отрисоваться перед инициализацией виджета капчи.
    setTimeout(() => this.initCaptcha(), 500);
  }

  onSubmit(): void {
    if (this.cancelForm.invalid || this.isSubmitting) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    let captchaToken = this.captchaToken;

    if (this.CAPTCHA_ENABLED && !captchaToken) {
      captchaToken = this.captchaService.getResponse(this.CAPTCHA_CONTAINER_ID);
    }

    if (this.CAPTCHA_ENABLED && !captchaToken) {
      this.errorMessage = 'Пожалуйста, пройдите проверку капчи.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const req = new SubscriptionCancelRequest({
      email: this.cancelForm.get('email')?.value || '',
      captchaToken: captchaToken || '',
    });

    this.subscriptionService.cancel(req)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response: SubscriptionCancelResponse) => {
          this.successMessage = response.message || 'Ваша подписка была отменена. Никаких списаний больше не будет.';
          this.cancelForm.reset();
          this.captchaToken = null;
          if (this.CAPTCHA_ENABLED) {
            this.refreshCaptcha();
          }
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Не удалось отменить подписку. Пожалуйста, попробуйте еще раз позже.';
          if (this.CAPTCHA_ENABLED) {
            this.refreshCaptcha();
          }
        }
      });
  }

  isCaptchaCompleted(): boolean {
    if (!this.CAPTCHA_ENABLED) {
      return true;
    }
    return !!(this.captchaToken || this.captchaService.getResponse(this.CAPTCHA_CONTAINER_ID));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.CAPTCHA_ENABLED) {
      this.captchaService.destroy(this.CAPTCHA_CONTAINER_ID);
    }
  }

  private initCaptcha(): void {
    this.captchaLoaded = false;

    this.captchaService.render({
      siteKey: this.environment.CAPTCHA_SITEKEY,
      containerId: this.CAPTCHA_CONTAINER_ID,
      invisible: false,
      hideShield: true,
      shieldPosition: 'top-left',
      callback: this.onCaptchaSuccess.bind(this),
    }).subscribe({
      next: () => {
        this.captchaLoaded = true;
      },
      error: () => {
        this.errorMessage = 'Не удалось загрузить капчу. Обновите страницу и попробуйте снова.';
      }
    });
  }

  private refreshCaptcha(): void {
    this.captchaToken = null;
    this.captchaService.destroy(this.CAPTCHA_CONTAINER_ID);
    setTimeout(() => this.initCaptcha(), 150);
  }

  private onCaptchaSuccess(token: string): void {
    this.captchaToken = token;
  }
}
