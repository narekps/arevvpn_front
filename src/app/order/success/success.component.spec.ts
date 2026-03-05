import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SuccessComponent} from './success.component';
import {OrderService} from '../../services/order.service';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {provideAnimations} from '@angular/platform-browser/animations';

describe('SuccessComponent', () => {
  let component: SuccessComponent;
  let fixture: ComponentFixture<SuccessComponent>;
  let orderService: jasmine.SpyObj<OrderService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(async () => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['success']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SuccessComponent],
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

    fixture = TestBed.createComponent(SuccessComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when paymentId is missing', () => {
    activatedRoute.queryParams = of({});
    orderService.success.and.returnValue(of({success: true}));

    fixture.detectChanges();

    expect(component.error).toBe('Отсутствует идентификатор платежа');
    expect(component.isLoading).toBeFalse();
    expect(orderService.success).not.toHaveBeenCalled();
  });

  it('should call OrderService.success with correct paymentId', () => {
    orderService.success.and.returnValue(of({success: true}));

    fixture.detectChanges();

    expect(orderService.success).toHaveBeenCalledWith(
      jasmine.objectContaining({paymentId: 'test-payment-id'})
    );
  });

  it('should show success message when activation is successful', (done) => {
    orderService.success.and.returnValue(of({success: true}));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.success).toBeTrue();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
      done();
    }, 50);
  });

  it('should show error message when activation fails', (done) => {
    const error = {error: {message: 'Payment not found'}};
    orderService.success.and.returnValue(throwError(() => error));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.success).toBeFalse();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('Payment not found');
      done();
    }, 50);
  });

  it('should show default error message when error has no message', (done) => {
    const error = {};
    orderService.success.and.returnValue(throwError(() => error));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.error).toBe('Произошла ошибка при активации подписки. Пожалуйста, свяжитесь с поддержкой.');
      done();
    }, 50);
  });

  it('should navigate to home when goToHome is called', () => {
    component.goToHome();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show loading state initially', () => {

    // Не вызываем detectChanges, чтобы проверить начальное состояние
    expect(component.isLoading).toBeTrue();
    expect(component.error).toBeNull();
    expect(component.success).toBeFalse();
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
