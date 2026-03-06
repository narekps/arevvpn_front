import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CallbackComponent} from './callback.component';
import {OrderService} from '../../services/order.service';
import {ActivatedRoute, Router} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import {provideAnimations} from '@angular/platform-browser/animations';

describe('CallbackComponent', () => {
  let component: CallbackComponent;
  let fixture: ComponentFixture<CallbackComponent>;
  let orderService: jasmine.SpyObj<OrderService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(async () => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['callback']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);

    // Добавляем events как Subject для RouterLink
    (routerSpy as any).events = new Subject();
    (routerSpy as any).url = '/callback';

    // Мокаем createUrlTree и serializeUrl чтобы RouterLink работал
    routerSpy.createUrlTree.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('/');

    await TestBed.configureTestingModule({
      imports: [CallbackComponent],
      providers: [
        {provide: OrderService, useValue: orderServiceSpy},
        {provide: Router, useValue: routerSpy},
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({paymentId: 'test-payment-id'})
          }
        },
        provideAnimations()
      ]
    }).compileComponents();

    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);

    fixture = TestBed.createComponent(CallbackComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when paymentId is missing', () => {
    activatedRoute.queryParams = of({});
    orderService.callback.and.returnValue(of({
      subscriptionUrl: 'https://example.com/subscription',
      paymentStatus: 'succeeded'
    }));

    fixture.detectChanges();

    expect(component.error).toBe('Отсутствует идентификатор платежа');
    expect(component.isLoading).toBeFalse();
    expect(orderService.callback).not.toHaveBeenCalled();
  });

  it('should call OrderService.callback with correct paymentId', () => {
    orderService.callback.and.returnValue(of({
      subscriptionUrl: 'https://example.com/subscription',
      paymentStatus: 'succeeded'
    }));

    fixture.detectChanges();

    expect(orderService.callback).toHaveBeenCalledWith(
      jasmine.objectContaining({paymentId: 'test-payment-id'})
    );
  });

  it('should show success message when activation is successful', (done) => {
    orderService.callback.and.returnValue(of({
      subscriptionUrl: 'https://example.com/subscription',
      paymentStatus: 'succeeded'
    }));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
      expect(component.paymentStatus).toBe('succeeded');
      expect(component.subscriptionUrl).toBe('https://example.com/subscription');
      done();
    }, 50);
  });

  it('should show error message when activation fails', (done) => {
    const error = {error: {message: 'Payment not found'}};
    orderService.callback.and.returnValue(throwError(() => error));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('Payment not found');
      done();
    }, 50);
  });

  it('should show default error message when error has no message', (done) => {
    const error = {};
    orderService.callback.and.returnValue(throwError(() => error));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.error).toBe('Произошла ошибка при активации подписки. Пожалуйста, свяжитесь с поддержкой.');
      done();
    }, 50);
  });

  it('should show loading state initially', () => {

    // Не вызываем detectChanges, чтобы проверить начальное состояние
    expect(component.isLoading).toBeTrue();
    expect(component.error).toBeNull();
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should detect succeeded payment status', (done) => {
    orderService.callback.and.returnValue(of({
      subscriptionUrl: 'https://example.com/subscription',
      paymentStatus: 'succeeded'
    }));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isPaymentSucceeded()).toBeTrue();
      expect(component.isPaymentCanceled()).toBeFalse();
      expect(component.isPaymentPending()).toBeFalse();
      done();
    }, 50);
  });

  it('should detect canceled payment status', (done) => {
    orderService.callback.and.returnValue(of({
      subscriptionUrl: '',
      paymentStatus: 'canceled'
    }));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isPaymentCanceled()).toBeTrue();
      expect(component.isPaymentSucceeded()).toBeFalse();
      expect(component.isPaymentPending()).toBeFalse();
      done();
    }, 50);
  });

  it('should detect pending payment status', (done) => {
    orderService.callback.and.returnValue(of({
      subscriptionUrl: '',
      paymentStatus: 'pending'
    }));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isPaymentPending()).toBeTrue();
      expect(component.isPaymentSucceeded()).toBeFalse();
      expect(component.isPaymentCanceled()).toBeFalse();
      done();
    }, 50);
  });

  it('should detect waiting_for_capture payment status as pending', (done) => {
    orderService.callback.and.returnValue(of({
      subscriptionUrl: '',
      paymentStatus: 'waiting_for_capture'
    }));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isPaymentPending()).toBeTrue();
      expect(component.isPaymentSucceeded()).toBeFalse();
      expect(component.isPaymentCanceled()).toBeFalse();
      done();
    }, 50);
  });

  it('should show warning on beforeunload when payment is pending', () => {
    component.paymentStatus = 'pending';
    const event = {returnValue: ''};

    component.unloadNotification(event);

    expect(event.returnValue).toBe('Платеж находится в обработке. Если вы закроете страницу, платеж может потеряться и вам потребуется связаться со службой поддержки.');
  });

  it('should show warning on beforeunload when payment is waiting_for_capture', () => {
    component.paymentStatus = 'waiting_for_capture';
    const event = {returnValue: ''};

    component.unloadNotification(event);

    expect(event.returnValue).toBe('Платеж находится в обработке. Если вы закроете страницу, платеж может потеряться и вам потребуется связаться со службой поддержки.');
  });

  it('should not show warning on beforeunload when payment is succeeded', () => {
    component.paymentStatus = 'succeeded';
    const event = {returnValue: ''};

    component.unloadNotification(event);

    expect(event.returnValue).toBe('');
  });

  it('should not show warning on beforeunload when payment is canceled', () => {
    component.paymentStatus = 'canceled';
    const event = {returnValue: ''};

    component.unloadNotification(event);

    expect(event.returnValue).toBe('');
  });
});
