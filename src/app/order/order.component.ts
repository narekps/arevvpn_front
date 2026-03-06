import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {TariffService} from '../services/tariff.service';
import {OrderService} from '../services/order.service';
import {Tariff} from '../models/tariff/tariff';
import {MdbFormsModule} from 'mdb-angular-ui-kit/forms';
import {MdbLoadingModule} from 'mdb-angular-ui-kit/loading';
import {MoneyPipe} from '../shared/pipes/money.pipe';
import {Subject, takeUntil} from 'rxjs';
import {MdbRippleModule} from 'mdb-angular-ui-kit/ripple';
import {MdbCheckboxModule} from 'mdb-angular-ui-kit/checkbox';
import {MdbRadioModule} from 'mdb-angular-ui-kit/radio';
import {getMonthWord} from '../shared/util';
import {CreateOrderRequest} from "../models/order/order-data.interface";
import {environment} from "../../environments/environment";
import {YandexCaptchaService} from "../shared/services/yandex-captcha.service";
import {ToastComponent} from "../shared/components/toast/toast.component";
import {MdbNotificationRef, MdbNotificationService} from "mdb-angular-ui-kit/notification";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MdbFormsModule,
    MdbLoadingModule,
    MdbCheckboxModule,
    MdbRadioModule,
    MoneyPipe,
    MdbRippleModule,
  ]
})
export class OrderComponent implements OnInit, OnDestroy {
  protected readonly environment = environment;
  protected CAPTCHA_ENABLED = environment.CAPTCHA_ENABLED;
  private readonly CAPTCHA_CONTAINER_ID = 'captcha-container';
  captchaToken: string | null = null;
  captchaLoaded = false;

  notificationRef: MdbNotificationRef<ToastComponent> | null = null;

  orderForm: FormGroup;
  tariff: Tariff | null = null;
  isLoading: boolean = false;
  isCreatingOrder: boolean = false;
  error: string | null = null;
  paymentUrl: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tariffService: TariffService,
    private orderService: OrderService,
    private captchaService: YandexCaptchaService,
    private notificationService: MdbNotificationService,
    private fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      emailConfirm: ['', [Validators.required, Validators.email]],
      paymentMethod: ['1', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    }, { validators: this.emailMatchValidator });
  }

  private emailMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const email = group.get('email')?.value;
    const emailConfirm = group.get('emailConfirm')?.value;

    if (!email || !emailConfirm) {
      return null;
    }

    return email === emailConfirm ? null : { emailMismatch: true };
  }

  getMonthWord(count: number): string {
    return getMonthWord(count);
  }

  getTelegramBotLink(): string {
    return `https://t.me/${this.environment.TELEGRAM.BOT_NAME}`;
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const tariffId = params['tariffId'];

        if (!tariffId) {
          // Перенаправляем на главную страницу если параметра нет
          this.router.navigate(['/']);
          return;
        }

        // Загружаем тариф с бекенда
        this.loadTariff(tariffId);
      });
  }

  private loadTariff(tariffId: string): void {
    this.isLoading = true;
    this.error = null;

    this.tariffService.get(tariffId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tariff = response.tariff;
          this.isLoading = false;
          setTimeout(() => {
            this.initCaptcha();
          }, 1000);
        },
        error: (err) => {
          console.error('Error loading tariff:', err);
          this.error = 'Не удалось загрузить информацию о тарифе. Пожалуйста, попробуйте еще раз или выберите другой тариф.';
          this.isLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.orderForm.invalid || !this.tariff) {
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Проверяем токен через callback или через getResponse()
    let captchaToken = this.captchaToken;

    // Если токен не установлен через callback, пробуем получить через getResponse()
    if (environment.CAPTCHA_ENABLED && !captchaToken) {
      captchaToken = this.captchaService.getResponse(this.CAPTCHA_CONTAINER_ID);
    }

    // Проверяем наличие капчи, если она включена
    if (environment.CAPTCHA_ENABLED && !captchaToken) {
      if (this.notificationRef) {
        this.notificationRef.close()
      }
      this.notificationRef = this.notificationService.open(ToastComponent, {
        position: 'top-center',
        delay: environment.TOAST_ERROR_DURATION,
        autohide: true,
        data: {
          type: 'danger',
          title: 'Ошибка',
          message: 'Пожалуйста, пройдите проверку капчи'
        }
      });
      return;
    }

    const email = this.orderForm.get('email')?.value;
    this.isCreatingOrder = true;
    this.error = null;

    const req : CreateOrderRequest = new CreateOrderRequest({
      tariffId: this.tariff.id,
      email: email,
      agreeToTerms: this.orderForm.get('agreeToTerms')?.value,
      paymentMethod: parseInt(this.orderForm.get('paymentMethod')?.value, 10),
      captchaToken: captchaToken,
    })

    // Создаем заказ на бекенде
    this.orderService.createOrder(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Order created successfully:', response);
          this.paymentUrl = response.url;
          window.location.href = this.paymentUrl;
        },
        error: (err) => {
          console.error('Error creating order:', err);
          this.error = 'Ошибка при создании заказа. Пожалуйста, попробуйте позже.';
          this.isCreatingOrder = false;

          // Перерендеровываем капчу при ошибке чтобы пользователь мог пройти ее еще раз
          if (environment.CAPTCHA_ENABLED) {
            this.captchaToken = null;
            // Уничтожаем старую капчу
            this.captchaService.destroy(this.CAPTCHA_CONTAINER_ID);
            // Небольшая задержка для того чтобы DOM обновился
            setTimeout(() => {
              // Перерендеровываем капчу
              this.initCaptcha();
            }, 500);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Уничтожаем капчу при уничтожении компонента
    this.captchaService.destroy(this.CAPTCHA_CONTAINER_ID);
  }

  private initCaptcha(): void {
    if (!environment.CAPTCHA_ENABLED) {
      return;
    }

    // Привязываем контекст для callback функции
    const onSuccess = this.onCaptchaSuccess.bind(this);

    this.captchaService.render({
      siteKey: environment.CAPTCHA_SITEKEY,
      containerId: this.CAPTCHA_CONTAINER_ID,
      invisible: false,
      hideShield: true,
      shieldPosition: 'top-left',
      callback: onSuccess
    }).subscribe({
      next: () => {
        this.captchaLoaded = true;
      },
      error: (error) => {
        console.error('Error loading captcha:', error);
        this.notificationService.open(ToastComponent, {
          position: 'top-center',
          delay: environment.TOAST_ERROR_DURATION,
          autohide: true,
          data: {
            type: 'danger',
            title: 'Ошибка',
            message: 'Не удалось загрузить капчу. Пожалуйста, обновите страницу.'
          }
        });
      }
    });
  }

  private onCaptchaSuccess(token: string): void {
    this.captchaToken = token;
  }

  isCaptchaCompleted(): boolean {
    if (!environment.CAPTCHA_ENABLED) {
      return true;
    }
    const token = this.captchaToken || this.captchaService.getResponse(this.CAPTCHA_CONTAINER_ID);
    return !!token;
  }
}
