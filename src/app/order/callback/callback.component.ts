import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {OrderService} from '../../services/order.service';
import {Subject, takeUntil} from 'rxjs';
import {CommonModule} from '@angular/common';
import {MdbLoadingModule} from 'mdb-angular-ui-kit/loading';
import {OrderCallbackRequest} from '../../models/order/order-data.interface';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-order-callback',
  standalone: true,
  imports: [CommonModule, MdbLoadingModule, RouterLink],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  error: string | null = null;
  subscriptionUrl: string | null = null;
  paymentId: string;
  paymentStatus: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const paymentId = params['paymentId'];

        if (!paymentId) {
          this.error = 'Отсутствует идентификатор платежа';
          this.isLoading = false;
          return;
        }

        this.paymentId = paymentId;
        this.activateSubscription();
      });
  }

  public activateSubscription(): void {
    this.isLoading = true;
    this.error = null;

    const request = new OrderCallbackRequest({ paymentId: this.paymentId });

    this.orderService.callback(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.subscriptionUrl = response.subscriptionUrl;
          this.paymentStatus = response.paymentStatus;

          // Если платеж успешен, перенаправляем пользователя по ссылке подписки
          if (response.paymentStatus === 'succeeded' && response.subscriptionUrl) {
            window.location.href = `${response.subscriptionUrl}?callback=true`;
            return;
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error activating subscription:', err);
          this.error = err?.error?.message || 'Произошла ошибка при активации подписки. Пожалуйста, свяжитесь с поддержкой.';
          this.isLoading = false;
        }
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Показываем предупреждение только если платеж в обработке
    if (this.paymentStatus === 'pending' || this.paymentStatus === 'waiting_for_capture') {
      $event.returnValue = 'Платеж находится в обработке. Если вы закроете страницу, платеж может потеряться и вам потребуется связаться со службой поддержки.';
    }
  }

  isPaymentPending(): boolean {
    return this.paymentStatus === 'pending' || this.paymentStatus === 'waiting_for_capture';
  }

  isPaymentSucceeded(): boolean {
    return this.paymentStatus === 'succeeded';
  }

  isPaymentCanceled(): boolean {
    return this.paymentStatus === 'canceled';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
