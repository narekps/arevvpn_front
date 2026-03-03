import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { HomeComponent } from './home.component';
import { TariffService } from '../services/tariff.service';
import { ListResponse } from '../models/tariff/list-response';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let tariffService: jasmine.SpyObj<TariffService>;

  const trialTariff = {
    id: 'trial',
    name: 'Trial',
    description: 'Trial tariff',
    durationMonths: 1,
    amount: 0,
    currency: 'RUB',
    isActive: true,
    isTrial: true,
    isBestseller: false,
    isProfitable: false
  };

  const regularTariff = {
    id: 'regular',
    name: 'Regular',
    description: 'Regular tariff',
    durationMonths: 3,
    amount: 900,
    currency: 'RUB',
    isActive: true,
    isTrial: false,
    isBestseller: true,
    isProfitable: false
  };

  beforeEach(async () => {
    tariffService = jasmine.createSpyObj('TariffService', ['getList']);

    tariffService.getList.and.returnValue(
      of(new ListResponse({ tariffs: [trialTariff as any, regularTariff as any] } as any))
    );

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule],
      providers: [
        { provide: TariffService, useValue: tariffService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (globalThis as any).ym;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tariffs on init and split trial tariff', () => {
    expect(tariffService.getList).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.loadingError).toBeFalse();
    expect(component.trialTariff?.id).toBe('trial');
    expect(component.tariffs.length).toBe(1);
    expect(component.tariffs[0].id).toBe('regular');
  });

  it('should set loadingError when tariffs loading fails', () => {
    tariffService.getList.and.returnValue(throwError(() => new Error('Network error')));

    component.loadTariffs();

    expect(component.isLoading).toBeFalse();
    expect(component.loadingError).toBeTrue();
  });

  it('should scroll to target element when it exists', () => {
    const scrollIntoView = jasmine.createSpy('scrollIntoView');
    spyOn(document as any, 'getElementById').and.returnValue({ scrollIntoView } as any);

    component.scrollTo('tariffs');

    expect((document as any).getElementById.calls.mostRecent().args[0]).toBe('tariffs');
    expect(scrollIntoView.calls.mostRecent().args[0]).toEqual({ behavior: 'smooth', block: 'start' });
  });

  it('should toggle floating button visibility on window scroll', () => {
    const topEl = document.createElement('div');
    Object.defineProperty(topEl, 'offsetHeight', { value: 500 });
    component.topSection = new ElementRef(topEl);

    const scrollYSpy = spyOnProperty(window, 'scrollY', 'get').and.returnValue(100);
    component.onWindowScroll();
    expect(component.showFloatingBtn).toBeFalse();

    scrollYSpy.and.returnValue(350);
    component.onWindowScroll();
    expect(component.showFloatingBtn).toBeTrue();
  });

  it('should send metrics for main and floating buttons when ym is available', () => {
    const ymSpy = jasmine.createSpy('ym');
    (globalThis as any).ym = ymSpy;

    component.reachGoalMain();
    component.reachGoalFloat();

    expect(ymSpy.calls.allArgs()).toContain([105722538, 'reachGoal', 'buy_main']);
    expect(ymSpy.calls.allArgs()).toContain([105722538, 'reachGoal', 'buy_main_float']);
  });
});
