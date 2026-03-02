import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  numberAttribute,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { first, fromEvent, merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export const MDB_MULTI_RANGE = new InjectionToken<{}>('MDB_MULTI_RANGE');

@Directive({
  selector: '[mdbMultiRangeThumb]',
  exportAs: 'mdbMultiRangeThumb',
  standalone: false,
})
export class MdbMultiRangeThumbDirective implements OnInit, OnDestroy {
  @Input({ transform: numberAttribute }) startValue = 0;

  get host(): HTMLSpanElement {
    return this._elementRef.nativeElement;
  }

  coordinates: { initialX: number; currentX: number } = { initialX: 0, currentX: 0 };
  showTooltip = false;

  private _maxPosition: number;
  private _minPosition: number;
  private _numberOfAvailableValues = 0;
  private _sliderEl!: HTMLElement;
  private _sliderWidth = 0;
  private readonly _destroy$: Subject<void> = new Subject<void>();

  readonly THUMB_WIDTH = 16;

  @Output() readonly startDrag = new EventEmitter<void>();
  @Output() readonly changeValue = new EventEmitter<void>();
  @Output() readonly pointerMove = new EventEmitter<void>();

  constructor(
    private _elementRef: ElementRef,
    @Inject(DOCUMENT) private _document: any,
    private _ngZone: NgZone,
    private _cdRef: ChangeDetectorRef,
    @Inject(MDB_MULTI_RANGE) private _multiRange: any
  ) {}

  ngOnInit(): void {
    this._initValues();
    this._updatePosition(this.startValue);
    this._initDrag();

    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => {
          this._ngZone.runOutsideAngular(() => {
            const newSliderWidth = this._sliderEl.offsetWidth - this.THUMB_WIDTH;
            const scale = this._sliderWidth / newSliderWidth;

            this.coordinates.currentX = this.coordinates.currentX / scale;
            this._sliderWidth = newSliderWidth;

            this.host.style.left = `${this._getOffsetLeft()}px`;
            this._multiRange._updateHighlightedRange();
          });
        });
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  _updatePosition(value: number) {
    let valuePosition =
      (this._sliderWidth / this._numberOfAvailableValues) * (value - this._multiRange.min);
    if (valuePosition >= this._maxPosition) {
      valuePosition = this._maxPosition;
    }

    if (valuePosition <= this._minPosition) {
      valuePosition = this._minPosition;
    }

    this.coordinates.currentX = valuePosition;
    this.host.style.left = `${this._getOffsetLeft()}px`;
    this._maxPosition = this._getMaxPosition();
    this._minPosition = this._getMinPosition();
  }

  private _getMaxPosition(): number {
    let maxPosition = this._sliderWidth;
    const { nextThumb } = this._getThumbs();
    if (nextThumb) {
      maxPosition = nextThumb.coordinates.currentX;
    }

    return maxPosition;
  }

  private _getMinPosition(): number {
    let minPosition = 0;
    const { previousThumb } = this._getThumbs();

    if (previousThumb) {
      minPosition = previousThumb.coordinates.currentX;
    }
    return minPosition;
  }

  private _getOffsetLeft(): number {
    if (this.coordinates.currentX > this._sliderWidth) {
      return this._sliderWidth;
    }

    if (this.coordinates.currentX <= 0) {
      return 0;
    }

    if (this._multiRange.step > 0) {
      const currentStep =
        Math.round(
          this.coordinates.currentX / (this._sliderWidth / this._numberOfAvailableValues)
        ) / this._multiRange.step;
      const stepWidth =
        this._sliderWidth /
        (this._numberOfAvailableValues / (this._multiRange.step ? this._multiRange.step : 1));
      return stepWidth * currentStep;
    }

    return this.coordinates.currentX;
  }

  private _getThumbs() {
    let previousThumb = null;
    let nextThumb = null;
    const thumbs = this._multiRange.rangeThumbs?.toArray();
    if (thumbs?.length > 1) {
      const thumbIndex = this._multiRange.rangeThumbs.toArray().indexOf(this);
      previousThumb = thumbIndex > 0 ? thumbs[thumbIndex - 1] : null;
      nextThumb = thumbIndex < thumbs.length - 1 ? thumbs[thumbIndex + 1] : null;
    }
    return { previousThumb, nextThumb };
  }

  private _initDrag(): void {
    this._ngZone.runOutsideAngular(() => {
      const pointerStart$ = merge(
        fromEvent<MouseEvent>(this.host, 'mousedown'),
        fromEvent<TouchEvent>(this.host, 'touchstart')
      );

      const pointerEnd$ = merge(
        fromEvent<MouseEvent>(this._document, 'mouseup'),
        fromEvent<TouchEvent>(this._document, 'touchend')
      );

      const pointerDrag$ = merge(
        fromEvent<MouseEvent>(this._document, 'mousemove'),
        fromEvent<TouchEvent>(this._document, 'touchmove')
      );

      pointerStart$.pipe(takeUntil(this._destroy$)).subscribe((event: MouseEvent | TouchEvent) => {
        let clientX = 0;

        if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
          clientX = event.touches[0].clientX;
        } else if (event instanceof MouseEvent) {
          clientX = event.clientX;
        }
        this._maxPosition = this._getMaxPosition();
        this._minPosition = this._getMinPosition();
        this.coordinates.initialX = clientX - this.coordinates.currentX;
        this.host.classList.add('thumb-dragging');
        this.showTooltip = true;
        this.startDrag.emit();
        this._cdRef.detectChanges();

        pointerDrag$.pipe(takeUntil(pointerEnd$)).subscribe((event: MouseEvent | TouchEvent) => {
          this._ngZone.run(() => {
            event.preventDefault();
            this._updatePositionFromEvent(event);
            this._multiRange._updateHighlightedRange();
            this.pointerMove.emit();
          });
        });

        pointerEnd$.pipe(first()).subscribe(() => {
          this._ngZone.run(() => {
            this.showTooltip = false;
            this.host.classList.remove('thumb-dragging');
            this.changeValue.emit();
          });
          this._cdRef.detectChanges();
        });
      });
    });
  }

  private _initValues(): void {
    this._numberOfAvailableValues =
      this._multiRange.max - this._multiRange.min > 0
        ? this._multiRange.max - this._multiRange.min
        : 1;
    this._sliderEl = this.host.parentElement;
    this._sliderWidth = this._sliderEl.offsetWidth - this.THUMB_WIDTH;
    this._maxPosition = this._getMaxPosition();
    this._minPosition = this._getMinPosition();
  }

  private _updatePositionFromEvent(event: MouseEvent | TouchEvent): void {
    const clientX =
      typeof TouchEvent !== 'undefined' && event instanceof TouchEvent
        ? event.touches[0].clientX
        : (event as MouseEvent).clientX;
    const cursorPosition = clientX - this.coordinates.initialX;
    const stepSize = this._sliderWidth / this._numberOfAvailableValues;

    let isBoundary = false;
    if (cursorPosition < this._minPosition) {
      this.coordinates.currentX = this._minPosition;
      isBoundary = true;
    }

    if (cursorPosition > this._maxPosition) {
      this.coordinates.currentX = this._maxPosition;
      isBoundary = true;
    }

    if (!isBoundary && this._multiRange.step < 1) {
      this.coordinates.currentX = cursorPosition;
    }

    if (
      this._multiRange.step > 0 &&
      Math.round(cursorPosition / stepSize) % this._multiRange.step != 0
    ) {
      return;
    }

    if (this._multiRange.step > 0 && !isBoundary) {
      this.coordinates.currentX = cursorPosition;
    }

    this.host.style.left = `${this._getOffsetLeft()}px`;
  }
}
