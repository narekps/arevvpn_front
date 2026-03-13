import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import {ActivatedRoute, Router, NavigationEnd} from "@angular/router";
import {interval, Subscription} from 'rxjs';
import {environment} from "../environments/environment";
import {YandexMetrikaService} from "./core/services/yandex-metrika.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('headerSection') headerSection!: ElementRef<HTMLElement>;
  showHeader: boolean = true;

  protected readonly environment = environment;

  protected readonly currentYear = (new Date()).getFullYear();

  private fragmentSubscription: Subscription | null = null;

  constructor(
    public router: Router,
    private swUpdate: SwUpdate,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private yandexMetrikaService: YandexMetrikaService,
  ) {
  }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      // Проверяем при старте и каждый час
      interval(60 * 60 * 1000).subscribe(() => this.swUpdate.checkForUpdate());
      this.swUpdate.checkForUpdate();

      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        this.swUpdate.activateUpdate().then(() => document.location.reload());
      });
    }

    this.yandexMetrikaService.init();
  }

  ngAfterViewInit(): void {
    this.onWindowScroll();
    this.fragmentSubscription = this.route.fragment.subscribe(fragment => {
      setTimeout(() => {
        if (fragment) {
          this.scrollToFragment(fragment);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 300);
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (!this.route.snapshot.fragment) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.fragmentSubscription) {
      this.fragmentSubscription.unsubscribe();
    }
  }

  private scrollToFragment(fragment: string) {
    const element = document.querySelector(`#${fragment}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.headerSection) {
      const heroHeight = this.headerSection.nativeElement.offsetHeight;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      this.showHeader = scrollPosition < heroHeight;
      this.cdr.detectChanges();
    }
  }
}
