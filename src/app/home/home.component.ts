import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {DOCUMENT, NgClass, NgForOf, NgIf} from "@angular/common";
import {MdbRippleModule} from "mdb-angular-ui-kit/ripple";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {environment} from "../../environments/environment";
import {Subscription} from "rxjs";
import {MoneyPipe} from "../shared/pipes/money.pipe";
import {MdbAccordionModule} from "mdb-angular-ui-kit/accordion";
import {TariffService} from "../services/tariff.service";
import {Tariff} from "../models/tariff/tariff";
import {ListResponse} from "../models/tariff/list-response";
import {MonthWordPipe} from "../shared/pipes/month-word.pipe";

declare let ym: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    MdbRippleModule,
    RouterLink,
    MoneyPipe,
    RouterLinkActive,
    MdbAccordionModule,
    NgIf,
    NgForOf,
    NgClass,
    MonthWordPipe,

  ]
})
export class HomeComponent implements AfterViewInit, OnInit, OnDestroy {
  protected readonly environment = environment;
  @ViewChild('topSection') topSection!: ElementRef<HTMLElement>;
  showFloatingBtn: boolean = true;

  private fragmentSubscription: Subscription | null = null;

  public isLoading: boolean = false;
  public tariffs: Tariff[] = [];
  public trialTariff: Tariff | undefined;
  public loadingError: boolean = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef,
    private tariffService: TariffService,
  ) {
  }

  ngOnInit(): void {
    this.loadTariffs();
  }

  ngAfterViewInit(): void {
    this.onWindowScroll();
  }

  ngOnDestroy(): void {
    if (this.fragmentSubscription) {
      this.fragmentSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.topSection) {
      const topHeight = this.topSection.nativeElement.offsetHeight;
      const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      this.showFloatingBtn = scrollPosition > topHeight - 200;
      this.cdr.detectChanges();
    }
  }

  scrollTo(elementId: string): void {
    console.log('scrollTo', elementId);
    const element = this.document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  reachGoalMain() {
    if (typeof ym === 'function') {
      ym(105722538, 'reachGoal', 'buy_main');
    }
  }

  reachGoalFloat() {
    if (typeof ym === 'function') {
      ym(105722538, 'reachGoal', 'buy_main_float')
    }
  }

  getTelegramBotLink(): string {
    return `https://t.me/${this.environment.TELEGRAM.BOT_NAME}`;
  }

  loadTariffs(): void {
    this.isLoading = true;
    this.loadingError = false;

    this.tariffService.getList().subscribe({
      next: (response: ListResponse) => {
        this.isLoading = false;
        this.loadingError = false;
        this.trialTariff = response.tariffs.find(t => t.isTrial);
        this.tariffs = response.tariffs.filter(t => !t.isTrial);
      },
      error: (err) => {
        console.error('Error loading tariffs:', err);
        this.isLoading = false;
        this.loadingError = true;
      }
    });
  }
}
