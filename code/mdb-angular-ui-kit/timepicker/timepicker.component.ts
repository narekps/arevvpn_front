import {
  Component,
  ChangeDetectionStrategy,
  ViewContainerRef,
  ComponentRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectorRef,
  Renderer2,
  Inject,
  booleanAttribute,
} from '@angular/core';
import { OverlayRef, Overlay, OverlayConfig, ConnectionPositionPair } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { merge } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { MdbTimepickerContentComponent } from './timepicker.content';
import { MdbTimepickerToggleComponent } from './timepicker-toggle.component';
import { MdbTimepickerOptions, MdbTimepickerSelectedTime } from './timepicker.interface';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  template: '',
  selector: 'mdb-timepicker',
  exportAs: 'mdbTimePicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MdbTimepickerComponent implements OnDestroy {
  @Input({ transform: booleanAttribute }) autoClose = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) format12 = true;
  @Input({ transform: booleanAttribute }) format24 = false;
  @Input({ transform: booleanAttribute }) increment = false;
  @Input({ transform: booleanAttribute }) inline = false;
  @Input({ transform: booleanAttribute }) showClearBtn = true;
  @Input() maxTime = '';
  @Input() minTime = '';
  @Input()
  get options(): MdbTimepickerOptions {
    return this._options;
  }
  set options(value: MdbTimepickerOptions) {
    this._options = {
      ...this._options,
      ...value,
    };
  }
  private _options: MdbTimepickerOptions = {
    amLabel: 'AM',
    cancelLabel: 'Cancel',
    clearLabel: 'Clear',
    okLabel: 'Ok',
    pmLabel: 'PM',
  };
  @Input({ transform: booleanAttribute }) switchHoursToMinutesOnClick = true;

  @Output() timeChange = new EventEmitter<MdbTimepickerSelectedTime>();
  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() readonly clear = new EventEmitter<void>();

  private _value = '12:00AM';
  private _contentRef: ComponentRef<MdbTimepickerContentComponent>;
  private _overlayRef: OverlayRef | null;
  private _portal: ComponentPortal<MdbTimepickerContentComponent>;
  public input: HTMLInputElement;
  public toggle: MdbTimepickerToggleComponent;

  public _selectionChange$ = new Subject<string>();

  constructor(
    @Inject(DOCUMENT) private _document,
    private _cdRef: ChangeDetectorRef,
    private _overlay: Overlay,
    private _vcr: ViewContainerRef,
    private _renderer: Renderer2
  ) {}

  private _patchInputValues(): void {
    this._contentRef.instance.picker = this;
    this._contentRef.instance.autoClose = this.autoClose;
    this._contentRef.instance.options = this.options;
    this._contentRef.instance.increment = this.increment;
    this._contentRef.instance.format12 = this.format12;
    this._contentRef.instance.format24 = this.format24;
    this._contentRef.instance.value = this._timeToObj(this._value);
    this._contentRef.instance.inline = this.inline;
    this._contentRef.instance.showClearBtn = this.showClearBtn;

    this._contentRef.instance.switchHoursToMinutesOnClick = this.switchHoursToMinutesOnClick;

    if (this.maxTime) {
      this._contentRef.instance.maxTime = this._timeToObj(this.maxTime);
    }
    if (this.minTime) {
      this._contentRef.instance.minTime = this._timeToObj(this.minTime);
    }

    this._contentRef.instance.markForCheck();
  }

  protected _timeToObj(time: any): MdbTimepickerSelectedTime {
    const round = (x: number, roundBy: number) => {
      return x % roundBy < Math.round(roundBy / 2)
        ? x % roundBy === 0
          ? x
          : Math.ceil(x / roundBy) * roundBy
        : Math.floor(x / roundBy) * roundBy;
    };

    function toString(val: number): string {
      return val < 10 ? `0${val}` : `${val}`;
    }

    const hour = Number(time.split(':')[0]);
    let minute = Number(time.split(':')[1].match(/\d+/g));
    const ampm = time.match(/AM|PM/i) || ['AM'];

    if (this.increment) {
      minute = round(minute, 5);
    }

    return {
      h: toString(hour),
      m: toString(minute),
      ampm: ampm[0].toUpperCase(),
    };
  }
  public markForCheck(): void {
    this._cdRef.markForCheck();
  }

  open(): void {
    if (this.disabled) {
      return;
    }

    let overlayRef = this._overlayRef;
    if (!overlayRef) {
      this._portal = new ComponentPortal(MdbTimepickerContentComponent, this._vcr);
      overlayRef = this._overlay.create(this._getOverlayConfig());

      this._overlayRef = overlayRef;
    }

    if (overlayRef && this._overlayRef && !overlayRef.hasAttached()) {
      this._contentRef = this._overlayRef.attach(this._portal);
      this._patchInputValues();
      this._listenToOutsideClick();
    }

    if (!this.inline && this._hasVerticalScroll()) {
      const widthWithVerticalScroll = this._document.body.offsetWidth;

      this._renderer.setStyle(this._document.body, 'overflow', 'hidden');

      const widthWithoutVerticalScroll = this._document.body.offsetWidth;

      this._renderer.setStyle(
        this._document.body,
        'padding-right',
        `${widthWithoutVerticalScroll - widthWithVerticalScroll}px`
      );
    }

    this._emitTimeOpenedEvent();
  }

  close(): void {
    this._contentRef.instance._startHideAnimation();

    if (this._overlayRef.backdropElement) {
      this._renderer.setStyle(this._overlayRef.backdropElement, 'opacity', '0');
    }

    this._contentRef.instance._hideAnimationDone.pipe(take(1)).subscribe(() => {
      if (this._overlayRef && this._overlayRef.hasAttached()) {
        this._destroyOverlay();
      }

      if (!this.inline) {
        this._renderer.removeStyle(this._document.body, 'overflow');
        this._renderer.removeStyle(this._document.body, 'padding-right');
      }

      this._emitTimeClosedEvent();

      if (this.toggle) {
        this.toggle.button.nativeElement.focus();
      } else {
        this.input.focus();
      }
    });
  }

  _emitTimeChangeEvent(value: MdbTimepickerSelectedTime): void {
    this.timeChange.emit(value);
  }

  _emitTimeClosedEvent(): void {
    this.closed.emit();
  }

  _emitTimeOpenedEvent(): void {
    this.opened.emit();
  }

  _setValue(value: string): void {
    if (value) {
      this._value = value;
    } else {
      this._value = '12:00 AM';
    }

    if (value === '') {
      this._renderer.removeClass(this.input, 'active');
    } else {
      this._renderer.addClass(this.input, 'active');
    }
  }

  setInput(input: any): void {
    this.input = input.el.nativeElement;
    input._valueChange.subscribe((val: any) => {
      let match;

      if (this.format24) {
        match = val && val.match(/\d\d:\d\d/gi);
      } else {
        match = val && val.match(/\d\d:\d\d\s?(AM|PM)/gi);
      }

      if (match) {
        this._value = match[0];
      } else {
        this._value = '12:00 AM';
      }
    });
  }

  onChangeCb: (_: any) => void = () => {};
  onTouchedCb: () => void = () => {};

  registerOnChange(fn: any): void {
    this.onChangeCb = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCb = fn;
  }

  private _hasVerticalScroll(): boolean {
    return this._document.body.scrollHeight > this._document.documentElement.clientHeight;
  }

  private _getOverlayConfig(): OverlayConfig {
    const inlinePositionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this.input)
      .withPositions(this._getPositions())
      .withFlexibleDimensions(false);

    const dialogPositionStrategy = this._overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const inlineScrollStrategy = this._overlay.scrollStrategies.reposition();
    const dialogScrollStrategy = this._overlay.scrollStrategies.noop();

    const positionStrategy = this.inline ? inlinePositionStrategy : dialogPositionStrategy;
    const scrollStrategy = this.inline ? inlineScrollStrategy : dialogScrollStrategy;

    const overlayConfig = new OverlayConfig({
      hasBackdrop: this.inline ? false : true,
      backdropClass: 'mdb-timepicker-backdrop',
      scrollStrategy,
      positionStrategy,
    });

    return overlayConfig;
  }

  private _getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
      },
    ];
  }

  private _destroyOverlay(): void {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  private _listenToOutsideClick(): void {
    if (this._overlayRef) {
      merge(
        this._overlayRef.outsidePointerEvents(),
        this._overlayRef.keydownEvents().pipe(
          filter((event: KeyboardEvent) => {
            // Closing on alt + up is only valid when there's an input associated with the datepicker.
            return event.key === 'Escape';
          })
        )
      ).subscribe((event) => {
        if (event) {
          event.preventDefault();
        }
        this.close();
      });
    }
  }

  ngOnDestroy(): void {
    this._destroyOverlay();
  }
}
