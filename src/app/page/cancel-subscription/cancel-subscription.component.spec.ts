import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {of, throwError} from 'rxjs';

import {CancelSubscriptionComponent} from './cancel-subscription.component';
import {SubscriptionService} from '../../services/subscription.service';
import {YandexCaptchaService} from '../../shared/services/yandex-captcha.service';

describe('CancelSubscriptionComponent', () => {
  let component: CancelSubscriptionComponent;
  let fixture: ComponentFixture<CancelSubscriptionComponent>;
  let subscriptionService: jasmine.SpyObj<SubscriptionService>;
  let captchaService: jasmine.SpyObj<YandexCaptchaService>;

  beforeEach(async () => {
    const subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['cancel']);
    const captchaServiceSpy = jasmine.createSpyObj('YandexCaptchaService', ['render', 'getResponse', 'destroy']);
    captchaServiceSpy.render.and.returnValue(of(void 0));
    captchaServiceSpy.getResponse.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [CancelSubscriptionComponent],
      providers: [
        {provide: SubscriptionService, useValue: subscriptionServiceSpy},
        {provide: YandexCaptchaService, useValue: captchaServiceSpy},
      ]
    }).compileComponents();

    subscriptionService = TestBed.inject(SubscriptionService) as jasmine.SpyObj<SubscriptionService>;
    captchaService = TestBed.inject(YandexCaptchaService) as jasmine.SpyObj<YandexCaptchaService>;

    fixture = TestBed.createComponent(CancelSubscriptionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create cancel request successfully', fakeAsync(() => {
    subscriptionService.cancel.and.returnValue(of({message: 'Ваша подписка на VPN была отменена. Никаких списаний больше не будет.'} as any));

    fixture.detectChanges();
    tick();

    component.cancelForm.patchValue({email: 'user@example.com'});
    component.captchaToken = 'captcha-token';

    component.onSubmit();

    expect(subscriptionService.cancel).toHaveBeenCalledWith(jasmine.objectContaining({
      email: 'user@example.com',
      captchaToken: 'captcha-token'
    }));
    expect(component.successMessage).toBe('Ваша подписка на VPN была отменена. Никаких списаний больше не будет.');
    expect(component.errorMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
  }));

  it('should create cancel request successfully with message fallback', fakeAsync(() => {
    subscriptionService.cancel.and.returnValue(of({} as any));

    fixture.detectChanges();
    tick();

    component.cancelForm.patchValue({email: 'user@example.com'});
    component.captchaToken = 'captcha-token';

    component.onSubmit();

    expect(subscriptionService.cancel).toHaveBeenCalledWith(jasmine.objectContaining({
      email: 'user@example.com',
      captchaToken: 'captcha-token'
    }));
    expect(component.successMessage).toBe('Ваша подписка была отменена. Никаких списаний больше не будет.');
    expect(component.errorMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
  }));

  it('should not submit without captcha token when captcha is enabled', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.cancelForm.patchValue({email: 'user@example.com'});
    component.captchaToken = null;
    captchaService.getResponse.and.returnValue(null);

    component.onSubmit();

    expect(subscriptionService.cancel).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Пожалуйста, пройдите проверку капчи.');
  }));

  it('should show backend error and refresh captcha on failed request', fakeAsync(() => {
    subscriptionService.cancel.and.returnValue(throwError(() => ({error: {message: 'Ошибка отмены'}})));

    fixture.detectChanges();
    tick();

    component.cancelForm.patchValue({email: 'user@example.com'});
    component.captchaToken = 'captcha-token';

    component.onSubmit();

    tick(150);

    expect(component.errorMessage).toBe('Ошибка отмены');
    expect(component.isSubmitting).toBeFalse();
    expect(captchaService.destroy).toHaveBeenCalled();
  }));
});
