import {
  AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  OnDestroy,
  AfterContentInit,
} from '@angular/core';
import { merge, Subject } from 'rxjs';
import { startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MdbRatingIconComponent } from './rating-icon.component';
@Component({
  selector: 'mdb-rating',
  templateUrl: 'rating.component.html',
  standalone: false,
})
export class MdbRatingComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  @ContentChildren(MdbRatingIconComponent) icons: QueryList<MdbRatingIconComponent>;

  @Input() readonly = false;
  @Input()
  get value(): number {
    return this._value;
  }
  set value(newValue: number) {
    if (newValue !== this.value && typeof newValue === 'number' && !isNaN(newValue)) {
      this._value = newValue < 0 ? 0 : newValue;
    }
    if (this.icons) {
      this.setActive(this.value);
    }
  }
  private _value = 0;

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onSelect: EventEmitter<number> = new EventEmitter();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onHover: EventEmitter<number> = new EventEmitter();

  private _iconIndex: number;
  private _icon: string;
  private _selectedIcon: string;

  readonly _destroy$: Subject<void> = new Subject<void>();

  constructor() {}

  ngAfterContentInit(): void {
    this.setActive(this.value);
  }

  ngAfterViewInit(): void {
    if (this.readonly) {
      this.icons.forEach((icon) => {
        icon.disabled = true;
      });
      return;
    }

    this.icons.changes
      .pipe(
        startWith(this.icons),
        switchMap((icons: QueryList<MdbRatingIconComponent>) => {
          return merge(...icons.map((icon: MdbRatingIconComponent) => icon.activeIcon));
        }),
        takeUntil(this._destroy$)
      )
      .subscribe((icon: MdbRatingIconComponent) => {
        const index = this.icons.toArray().findIndex((el) => {
          return el === icon;
        });

        this._iconIndex = index;
        this._icon = icon.icon;
        this.setActive(index + 1, this._icon);
        this.onHover.emit(this._iconIndex + 1);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.unsubscribe();
  }

  setActive(iconIndex: number, iconClass?: string): void {
    this.icons.forEach((icon, index) => {
      if (index >= iconIndex) {
        icon.setActive(false);
      } else {
        const properIcon = iconClass || (icon.icon ? icon.icon : '');
        icon.setActive(true, properIcon);
      }
    });
  }

  onClick(): void {
    if (this.readonly) {
      return;
    }

    this.value = this._iconIndex + 1;
    this._selectedIcon = this._icon;
    this.onSelect.emit(this.value);
  }

  onMouseleave(): void {
    if (this.readonly) {
      return;
    }

    if (this.value) {
      this.setActive(this.value, this._selectedIcon);
    } else {
      this.setActive(-1);
    }
  }
}
