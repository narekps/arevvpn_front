import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrderComponent} from './order.component';
import {TariffService} from '../services/tariff.service';
import {OrderService} from '../services/order.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {of, throwError} from 'rxjs';
import {Tariff} from '../models/tariff/tariff';
import {GetResponse} from '../models/tariff/get-response';
import {MdbNotificationService} from 'mdb-angular-ui-kit/notification';
import {YandexCaptchaService} from '../shared/services/yandex-captcha.service';
import {provideAnimations} from '@angular/platform-browser/animations';

describe('OrderComponent', () => {
  let component: OrderComponent;
  let fixture: ComponentFixture<OrderComponent>;
  let tariffService: jasmine.SpyObj<TariffService>;
  let orderService: jasmine.SpyObj<OrderService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockTariff: Tariff = {
    id: '1',
    name: 'Test Tariff',
    description: 'Test Description',
    durationMonths: 1,
    amount: 100,
    currency: 'USD',
    isActive: true,
    isTrial: false,
    isBestseller: false,
    isProfitable: false
  };

  beforeEach(async () => {
    const tariffServiceSpy = jasmine.createSpyObj('TariffService', ['get']);
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['createOrder']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const captchaServiceSpy = jasmine.createSpyObj('YandexCaptchaService', ['loadCaptcha', 'execute', 'getResponse', 'destroy', 'reset', 'render']);
    captchaServiceSpy.getResponse.and.returnValue(null);
    captchaServiceSpy.render.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [OrderComponent, ReactiveFormsModule],
      providers: [
        {provide: TariffService, useValue: tariffServiceSpy},
        {provide: OrderService, useValue: orderServiceSpy},
        {provide: Router, useValue: routerSpy},
        {provide: YandexCaptchaService, useValue: captchaServiceSpy},
        MdbNotificationService,
        provideAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({tariffId: '1'})
          }
        }
      ]
    }).compileComponents();

    tariffService = TestBed.inject(TariffService) as jasmine.SpyObj<TariffService>;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);

    fixture = TestBed.createComponent(OrderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to home when tariffId is missing', () => {
    activatedRoute.queryParams = of({});
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should load tariff when tariffId is present', () => {
    const response = new GetResponse({tariff: mockTariff} as any);
    tariffService.get.and.returnValue(of(response));

    fixture.detectChanges();

    expect(tariffService.get).toHaveBeenCalledWith('1');
    expect(component.tariff).toEqual(jasmine.objectContaining(mockTariff));
  });

  it('should handle tariff loading error', (done) => {
    const error = new Error('Loading failed');
    tariffService.get.and.returnValue(throwError(() => error));

    // Устанавливаем queryParams для инициирования загрузки тарифа
    activatedRoute.queryParams = of({tariffId: '1'});
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.error).toBeTruthy();
      expect(component.isLoading).toBeFalse();
      done();
    }, 100);
  });

  it('should validate email field', () => {
    const emailControl = component.orderForm.get('email');

    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTruthy();

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should submit form and create order', (done) => {
    const response = new GetResponse({tariff: mockTariff} as any);
    tariffService.get.and.returnValue(of(response));
    orderService.createOrder.and.returnValue(of({url: 'https://pay.example.com'}));

    fixture.detectChanges();

    // Устанавливаем тариф
    component.tariff = mockTariff;
    // Устанавливаем токен капчи (для обхода проверки капчи)
    component.captchaToken = 'test-token';
    fixture.detectChanges();

    // Заполняем форму
    component.orderForm.patchValue({
      email: 'test@example.com',
      emailConfirm: 'test@example.com',
      paymentMethod: 1,
      agreeToTerms: true
    });
    fixture.detectChanges();

    // Проверяем что форма валидна перед отправкой
    expect(component.orderForm.valid).toBeTruthy();

    component.onSubmit();
    fixture.detectChanges();

    setTimeout(() => {
      expect(orderService.createOrder).toHaveBeenCalled();
      expect(component.paymentUrl).toBe('https://pay.example.com');
      expect(component.isCreatingOrder).toBeFalse();
      done();
    }, 50);
  });

  it('should handle order creation error', (done) => {
    const response = new GetResponse({tariff: mockTariff} as any);
    tariffService.get.and.returnValue(of(response));
    const error = new Error('Order creation failed');
    orderService.createOrder.and.returnValue(throwError(() => error));

    fixture.detectChanges();

    // Устанавливаем тариф
    component.tariff = mockTariff;
    // Устанавливаем токен капчи (для обхода проверки капчи)
    component.captchaToken = 'test-token';
    fixture.detectChanges();

    // Заполняем форму
    component.orderForm.patchValue({
      email: 'test@example.com',
      emailConfirm: 'test@example.com',
      paymentMethod: 1,
      agreeToTerms: true
    });
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.error).toBeTruthy();
      expect(component.error).toContain('Ошибка при создании заказа');
      done();
    }, 50);
  });
});
