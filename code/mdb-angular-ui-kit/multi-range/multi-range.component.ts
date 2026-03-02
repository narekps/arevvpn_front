import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  numberAttribute,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MDB_MULTI_RANGE, MdbMultiRangeThumbDirective } from './multi-range-thumb.directive';
import { fadeInAnimation } from './multi-range-thumb.animations';
import { merge, Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type mdbMultiRangeValues = number[];
@Component({
  selector: 'mdb-multi-range',
  templateUrl: `./multi-range.component.html`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MdbMultiRangeComponent),
      multi: true,
    },
    { provide: MDB_MULTI_RANGE, useExisting: MdbMultiRangeComponent },
  ],
  styles: [],
  animations: [fadeInAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MdbMultiRangeComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChildren('rangeThumb') rangeThumbs: QueryList<MdbMultiRangeThumbDirective>;

  @Input({ transform: booleanAttribute }) highlightRange = false;
  @Input({ transform: numberAttribute }) max = 100;
  @Input({ transform: numberAttribute }) min = 0;
  @Input({ transform: numberAttribute }) numberOfRanges = 2;
  @Input({ transform: booleanAttribute }) tooltip = false;
  @Input()
  get startValues(): number[] {
    return this._startValues;
  }
  set startValues(value: number[]) {
    this._startValues = value;
    this.val = value;
  }
  private _startValues = [0, 100];
  @Input({ transform: numberAttribute }) step = 0;

  @Output() readonly startDrag = new EventEmitter<void>();
  @Output() readonly endDrag = new EventEmitter<void>();
  @Output() readonly changeValue = new EventEmitter<void>();

  constructor(private _elRef: ElementRef, private _cdRef: ChangeDetectorRef) {}

  get host(): HTMLElement {
    return this._elRef.nativeElement;
  }
  _onChange: any = (_: any) => {};
  _onTouched: any = () => {};
  readonly THUMB_WIDTH = 16;
  private readonly _destroy$: Subject<void> = new Subject<void>();

  val: number[] = [this.startValues[0], this.startValues[1]];
  set value(val: mdbMultiRangeValues) {
    this.val = val;
    this._cdRef.markForCheck();
  }

  highlightedRangeLeft = 0;
  highlightedRangeWidth = 0;

  ngAfterViewInit() {
    setTimeout(() => {
      this._onChange(this._getCurrentValues());
      this.rangeThumbs.forEach((thumb) => {
        fromEvent(thumb.host, 'blur')
          .pipe(takeUntil(this._destroy$))
          .subscribe(() => {
            this._onTouched();
          });
      });
    }, 0);

    merge(...this.rangeThumbs.map((thumb) => thumb.changeValue))
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._onChange(this._getCurrentValues());
        this.value = this._getCurrentValues();
        this.changeValue.emit();
        this.endDrag.emit();
      });

    merge(...this.rangeThumbs.map((thumb) => thumb.startDrag))
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._onChange(this._getCurrentValues());
        this.value = this._getCurrentValues();
        this.startDrag.emit();
      });

    merge(...this.rangeThumbs.map((thumb) => thumb.pointerMove))
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        if (JSON.stringify(this._getCurrentValues()) === JSON.stringify(this.val)) {
          return;
        }
        this._onChange(this._getCurrentValues());
        this.value = this._getCurrentValues();
      });

    this._updateHighlightedRange();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _getCurrentValues(): number[] {
    const currentValues: number[] = [];
    const numberOfAvailableValues = this.max - this.min > 0 ? this.max - this.min : 1;

    this.rangeThumbs.forEach((thumb, index) => {
      const styleLeft = Number(thumb.host.style.left.split('px')[0]);

      let currentValue =
        Math.round(
          styleLeft / ((this.host.offsetWidth - this.THUMB_WIDTH) / numberOfAvailableValues)
        ) + this.min;

      if (currentValue < this.min) {
        currentValue = this.min;
      }

      if (currentValue > this.max) {
        currentValue = this.max;
      }

      currentValues[index] = currentValue;
    });

    return currentValues;
  }

  private _updateThumbsPosition(value: mdbMultiRangeValues) {
    const [firstNewValue, secondNewValue] = value;
    const [firstOldValue, secondOldValue] = this.val;
    const rangeThumbs = this.rangeThumbs?.toArray();
    if (firstNewValue !== firstOldValue && rangeThumbs) {
      rangeThumbs[0]._updatePosition(firstNewValue);
    }
    if (secondNewValue !== secondOldValue && rangeThumbs) {
      rangeThumbs[1]._updatePosition(secondNewValue);
    }
  }

  private _updateHighlightedRange() {
    if (!this.highlightRange || this.numberOfRanges > 2) {
      return;
    }

    const [firstThumb, secondThumb] = this.rangeThumbs?.toArray();
    const firstThumbLeft = parseInt(firstThumb.host.style.left);
    if (firstThumb && !secondThumb) {
      this.highlightedRangeWidth = firstThumbLeft + this.THUMB_WIDTH;
    }
    if (firstThumb && secondThumb) {
      const secondThumbLeft = parseInt(secondThumb.host.style.left);
      this.highlightedRangeWidth = secondThumbLeft - firstThumbLeft;
      this.highlightedRangeLeft = firstThumbLeft + this.THUMB_WIDTH;
    }
    this._cdRef.markForCheck();
  }

  // Control value accessor methods

  writeValue(value: mdbMultiRangeValues) {
    if (value) {
      this._updateThumbsPosition(value);
      this._updateHighlightedRange();
      this.value = value;
    }
  }

  registerOnChange(fn: any) {
    this._onChange = fn;
  }

  registerOnTouched(fn: any) {
    this._onTouched = fn;
  }
}
