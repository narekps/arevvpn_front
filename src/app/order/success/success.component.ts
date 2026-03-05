import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../services/order.service';
import {Subject, takeUntil} from 'rxjs';
import {CommonModule} from '@angular/common';
import {MdbLoadingModule} from 'mdb-angular-ui-kit/loading';
import {OrderSuccessRequest} from '../../models/order/order-data.interface';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, MdbLoadingModule],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  error: string | null = null;
  success: boolean = false;
  subscriptionUrl: string | null = null;
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

        this.activateSubscription(paymentId);
      });
  }

  private activateSubscription(paymentId: string): void {
    this.isLoading = true;
    this.error = null;

    const request = new OrderSuccessRequest({ paymentId: paymentId });

    this.orderService.success(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Subscription activated:', response);
          this.success = response.success;
          this.subscriptionUrl = response.subscriptionUrl;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error activating subscription:', err);
          this.error = err?.error?.message || 'Произошла ошибка при активации подписки. Пожалуйста, свяжитесь с поддержкой.';
          this.isLoading = false;
        }
      });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToSubscription(): void {
    if (this.subscriptionUrl) {
      window.location.href = this.subscriptionUrl;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
