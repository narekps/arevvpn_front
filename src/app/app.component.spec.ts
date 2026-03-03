import { TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: false,
            checkForUpdate: jasmine.createSpy('checkForUpdate'),
            versionUpdates: of(),
            activateUpdate: jasmine.createSpy('activateUpdate')
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of(null),
            snapshot: { fragment: null }
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render main layout blocks', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-cookie-consent')).toBeTruthy();
  });

  it('should toggle mobile header visibility on scroll', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const headerEl = document.createElement('div');
    Object.defineProperty(headerEl, 'offsetHeight', { value: 100 });
    app.headerSection = new ElementRef(headerEl);
    spyOnProperty(window, 'pageYOffset', 'get').and.returnValue(250);

    app.onWindowScroll();

    expect(app.showHeader).toBeTrue();
  });
});
