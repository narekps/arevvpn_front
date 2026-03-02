import { Component, Provider, Type, ViewChild } from '@angular/core';
import { TestBed, ComponentFixture, inject, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MdbTimepickerModule } from './timepicker.module';
import { MdbTimepickerComponent } from './timepicker.component';
import { MdbTimepickerDirective } from './timepicker.directive';
import { MdbTimepickerContentComponent } from './timepicker.content';

const NAME = 'timepicker';
const SELECTOR_CONTAINER = `.${NAME}-container`;
const SELECTOR_INLINE = `${SELECTOR_CONTAINER} .${NAME}-elements-inline`;
const SELECTOR_BTN_TOGGLE = `.${NAME}-toggle-button`;
const SELECTOR_CURRENT_HOUR = `.${NAME}-hour`;
const SELECTOR_CURRENT_MINUTE = `.${NAME}-minute`;
const SELECTOR_AM_BTN = `.${NAME}-am`;
const SELECTOR_PM_BTN = `.${NAME}-pm`;
const SELECTOR_INLINE_HOUR_ARROW_UP_BTN = `.${NAME}-icon-up.${NAME}-icon-inline-hour`;
const SELECTOR_INLINE_HOUR_ARROW_DOWN_BTN = `.${NAME}-icon-down.${NAME}-icon-inline-hour`;
const SELECTOR_INLINE_MINUTE_ARROW_UP_BTN = `.${NAME}-icon-up.${NAME}-icon-inline-minute`;
const SELECTOR_INLINE_MINUTE_ARROW_DOWN_BTN = `.${NAME}-icon-down.${NAME}-icon-inline-minute`;
const SELECTOR_OK_BTN = `.${NAME}-submit`;
const SELECTOR_INLINE_OK_BTN = `.${NAME}-submit-inline`;
const SELECTOR_TIPS_HOUR = `.${NAME}-time-tips-hours`;
const SELECTOR_TIPS_MINUTE = `.${NAME}-time-tips-minutes`;
const SELECTOR_CLEAR_BTN = `.${NAME}-clear`;
const SELECTOR_CANCEL_BTN = `.${NAME}-cancel`;

@Component({
  selector: 'mdb-basic-timepicker',
  template: `
    <mdb-form-control>
      <input
        mdbInput
        type="text"
        id="form1"
        class="form-control"
        [mdbTimepicker]="timepicker"
        required
      />
      <label mdbLabel class="form-label" for="form1">Example label</label>
      <mdb-timepicker-toggle
        *ngIf="!iconTemplate"
        [disabled]="disabled"
        [mdbTimepickerToggle]="timepicker"
        [icon]="icon"
      >
      </mdb-timepicker-toggle>
      <mdb-timepicker-toggle *ngIf="iconTemplate" [mdbTimepickerToggle]="timepicker">
        <ng-template mdbTimepickerToggleIcon
          ><i class="fa-angular fab timepicker-icon"></i></ng-template
      ></mdb-timepicker-toggle>
      <mdb-timepicker
        #timepicker
        [inline]="inline"
        [format12]="format12"
        [format24]="format24"
        [disabled]="disabled"
        [increment]="increment"
        [showClearBtn]="showClearBtn"
      ></mdb-timepicker>
    </mdb-form-control>
  `,
  standalone: false,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
class BasicTimepicker {
  inline = false;
  startDate = new Date();
  view = 'days';
  format12 = true;
  format24 = false;
  disabled = false;
  increment = false;
  showClearBtn = true;
  icon = 'far fa-clock';
  iconTemplate = false;

  @ViewChild(MdbTimepickerComponent, { static: true }) timepicker: MdbTimepickerComponent;
  @ViewChild(MdbTimepickerDirective, { static: true })
  timepickerDirective: MdbTimepickerDirective;
}

describe('MDB Timepicker', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<BasicTimepicker>;
  let input: HTMLInputElement;
  let timepicker: MdbTimepickerComponent;
  let timepickerDirective: MdbTimepickerDirective;
  let testComponent: BasicTimepicker;

  function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        MdbTimepickerModule,
        MdbFormsModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      declarations: [component],
      providers: [...providers],
      teardown: { destroyAfterEach: false },
    });

    TestBed.compileComponents();

    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    })();

    return TestBed.createComponent<T>(component);
  }

  beforeEach(() => {
    fixture = createComponent(BasicTimepicker);
    fixture.detectChanges();
    testComponent = fixture.componentInstance;
    timepicker = testComponent.timepicker;
    timepickerDirective = testComponent.timepickerDirective;
    input = fixture.debugElement.query(By.css('input')).nativeElement;
  });

  afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
    currentOverlayContainer.ngOnDestroy();
    overlayContainer.ngOnDestroy();
  }));

  describe('Opening and closing', () => {
    it('should open and close component in modal mode by default', fakeAsync(() => {
      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CONTAINER)).not.toBeNull();

      timepicker.close();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CONTAINER)).toBeNull();
    }));

    it('should open and close component in inline mode if inline input is set to true', fakeAsync(() => {
      testComponent.inline = true;
      fixture.detectChanges();
      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_INLINE)).not.toBeNull();

      timepicker.close();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_INLINE)).toBeNull();
    }));

    it('should open component on toggle click', fakeAsync(() => {
      const toggleButton = fixture.nativeElement.querySelector(SELECTOR_BTN_TOGGLE);
      timepicker.inline = true;

      toggleButton.click();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CONTAINER)).not.toBeNull();
      expect(document.querySelector(SELECTOR_INLINE)).not.toBeNull();
    }));

    it('should not open component on toggle click if timepicker disabled input is set to true', fakeAsync(() => {
      const toggleButton = fixture.nativeElement.querySelector(SELECTOR_BTN_TOGGLE);
      timepicker.disabled = true;

      toggleButton.click();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CONTAINER)).toBeNull();
      expect(document.querySelector(SELECTOR_INLINE)).toBeNull();
    }));
    it('should not open component on toggle click if timepicker toggle disabled input is set to true', fakeAsync(() => {
      const toggleButton = fixture.nativeElement.querySelector(SELECTOR_BTN_TOGGLE);
      timepicker.toggle.disabled = true;

      toggleButton.click();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CONTAINER)).toBeNull();
      expect(document.querySelector(SELECTOR_INLINE)).toBeNull();
    }));

    it('should not open component on toggle click if disabled in inline mode', fakeAsync(() => {
      const toggleButton = fixture.nativeElement.querySelector(SELECTOR_BTN_TOGGLE);
      timepicker.inline = true;
      timepicker.disabled = true;

      toggleButton.click();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CONTAINER)).toBeNull();
      expect(document.querySelector(SELECTOR_INLINE)).toBeNull();
    }));

    it('should auto close after minute selection', fakeAsync(() => {
      const toggleButton = fixture.nativeElement.querySelector(SELECTOR_BTN_TOGGLE);
      timepicker.autoClose = true;

      toggleButton.click();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CONTAINER)).not.toBeNull();

      const hourTips = document.querySelectorAll(`${SELECTOR_TIPS_HOUR}`);

      hourTips[2].dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
        })
      );
      document.dispatchEvent(new MouseEvent('mouseup'));

      fixture.detectChanges();
      flush();

      const minuteTips = document.querySelectorAll(`${SELECTOR_TIPS_MINUTE}`);
      (minuteTips[2] as HTMLElement).dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
        })
      );
      document.dispatchEvent(new MouseEvent('mouseup'));

      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CONTAINER)).toBeNull();
    }));
  });

  describe('Options', () => {
    it('should show timepicker in 12h format by default', fakeAsync(() => {
      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_AM_BTN)).not.toBeNull();
      expect(document.querySelector(SELECTOR_PM_BTN)).not.toBeNull();

      timepicker.close();
      fixture.detectChanges();
      flush();

      expect(document.querySelector('mdb-timepicker-content')).toBeNull();

      timepicker.inline = true;
      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_AM_BTN)).not.toBeNull();
      expect(document.querySelector(SELECTOR_PM_BTN)).not.toBeNull();
    }));

    it('should show timepicker in 24h format if format24 input is set to true', fakeAsync(() => {
      timepicker.format24 = true;

      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_AM_BTN)).toBeNull();
      expect(document.querySelector(SELECTOR_PM_BTN)).toBeNull();

      timepicker.close();
      fixture.detectChanges();
      flush();

      expect(document.querySelector('mdb-timepicker-content')).toBeNull();

      timepicker.inline = true;
      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_AM_BTN)).toBeNull();
      expect(document.querySelector(SELECTOR_PM_BTN)).toBeNull();
    }));

    it('should disable time past maxTime', fakeAsync(() => {
      timepicker.maxTime = '6:35';

      timepicker.open();
      fixture.detectChanges();
      flush();

      const hourTips = document.querySelectorAll(`${SELECTOR_TIPS_HOUR}`);

      expect(hourTips[6].querySelector('.timepicker-tips-element').innerHTML).toBe('6');
      expect(hourTips[6].classList.contains('disabled')).toBe(false);
      expect(hourTips[7].querySelector('.timepicker-tips-element').innerHTML).toBe('7');
      expect(hourTips[7].classList.contains('disabled')).toBe(true);

      const componentInstance: any = timepicker;
      componentInstance._contentRef.instance._setHour(6);

      const currentMinute: HTMLElement = document.querySelector(SELECTOR_CURRENT_MINUTE);
      currentMinute.click();

      fixture.detectChanges();
      flush();

      const minuteTips = document.querySelectorAll(`${SELECTOR_TIPS_MINUTE}`);

      expect(minuteTips[7].querySelector('.timepicker-tips-element').innerHTML).toBe('35');
      expect(minuteTips[7].classList.contains('disabled')).toBe(false);
      expect(minuteTips[8].querySelector('.timepicker-tips-element').innerHTML).toBe('40');
      expect(minuteTips[8].classList.contains('disabled')).toBe(true);
    }));

    it('should disable time before minTime', fakeAsync(() => {
      timepicker.minTime = '6:35';

      timepicker.open();
      fixture.detectChanges();
      flush();

      const hourTips = document.querySelectorAll(`${SELECTOR_TIPS_HOUR}`);

      expect(hourTips[6].querySelector('.timepicker-tips-element').innerHTML).toBe('6');
      expect(hourTips[6].classList.contains('disabled')).toBe(false);
      expect(hourTips[5].querySelector('.timepicker-tips-element').innerHTML).toBe('5');
      expect(hourTips[5].classList.contains('disabled')).toBe(true);

      const componentInstance: any = timepicker;
      componentInstance._contentRef.instance._setHour(6);

      const currentMinute: HTMLElement = document.querySelector(SELECTOR_CURRENT_MINUTE);
      currentMinute.click();

      fixture.detectChanges();
      flush();

      const minuteTips = document.querySelectorAll(`${SELECTOR_TIPS_MINUTE}`);

      expect(minuteTips[7].querySelector('.timepicker-tips-element').innerHTML).toBe('35');
      expect(minuteTips[7].classList.contains('disabled')).toBe(false);
      expect(minuteTips[6].querySelector('.timepicker-tips-element').innerHTML).toBe('30');
      expect(minuteTips[6].classList.contains('disabled')).toBe(true);
    }));

    it('should use MdbTimepickerOptions passed in open method', fakeAsync(() => {
      timepicker.options = {
        amLabel: 'testAM',
        cancelLabel: 'testCancel',
        clearLabel: 'testClear',
        okLabel: 'testOk',
        pmLabel: 'testPM',
      };

      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_AM_BTN).textContent.trim()).toBe('testAM');
      expect(document.querySelector(SELECTOR_PM_BTN).textContent.trim()).toBe('testPM');
      expect(document.querySelector(SELECTOR_CANCEL_BTN).textContent.trim()).toBe('testCancel');
      expect(document.querySelector(SELECTOR_CLEAR_BTN).textContent.trim()).toBe('testClear');
      expect(document.querySelector(SELECTOR_OK_BTN).textContent.trim()).toBe('testOk');
    }));

    it('should disable switching to minutes when switchHoursToMinutesOnClick is set to false', fakeAsync(() => {
      timepicker.switchHoursToMinutesOnClick = false;
      timepicker.open();

      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CONTAINER)).not.toBeNull();

      const hourTips = document.querySelectorAll(`${SELECTOR_TIPS_HOUR}`);

      hourTips[2].dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
        })
      );
      document.dispatchEvent(new MouseEvent('mouseup'));

      fixture.detectChanges();
      flush();

      const currentHour: HTMLElement = document.querySelector(SELECTOR_CURRENT_HOUR);
      expect(currentHour.classList.contains('active')).toBe(true);
    }));
  });

  describe('change view', () => {
    it('should change view to minute and back to hour', fakeAsync(() => {
      timepicker.inline = false;

      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_TIPS_HOUR)).not.toBeNull();
      expect(document.querySelector(SELECTOR_TIPS_MINUTE)).toBeNull();

      const currentMinute: HTMLElement = document.querySelector(SELECTOR_CURRENT_MINUTE);
      currentMinute.click();

      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_TIPS_HOUR)).toBeNull();
      expect(document.querySelector(SELECTOR_TIPS_MINUTE)).not.toBeNull();

      const currentHour: HTMLElement = document.querySelector(SELECTOR_CURRENT_HOUR);
      currentHour.click();

      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_TIPS_HOUR)).not.toBeNull();
      expect(document.querySelector(SELECTOR_TIPS_MINUTE)).toBeNull();
    }));

    it('should hide clear button if showClearBtn is set to false', fakeAsync(() => {
      timepicker.showClearBtn = false;

      timepicker.open();
      fixture.detectChanges();
      flush();

      const clearBtn = document.querySelector(SELECTOR_CLEAR_BTN);
      expect(clearBtn).toBeNull();
    }));
  });

  describe('Events', () => {
    it('should emit opened events opened and closed', fakeAsync(() => {
      // expect(timepicker.disabled).toBe('pip');
      const openedSpy = jest.spyOn(timepicker.opened, 'emit');
      const closedSpy = jest.spyOn(timepicker.closed, 'emit');

      expect(openedSpy).toHaveBeenCalledTimes(0);
      expect(closedSpy).toHaveBeenCalledTimes(0);

      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(openedSpy).toHaveBeenCalledTimes(1);

      timepicker.close();
      fixture.detectChanges();
      flush();

      expect(closedSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit event timeChange and return selected value', fakeAsync(() => {
      const timeChangeSpy = jest.spyOn(timepicker.timeChange, 'emit');

      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(timeChangeSpy).toHaveBeenCalledTimes(0);

      const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
      contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      const okBtn: HTMLElement = document.querySelector(SELECTOR_OK_BTN);
      okBtn.click();

      fixture.detectChanges();
      flush();

      expect(timeChangeSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit clear event on clear', fakeAsync(() => {
      const clearSpy = jest.spyOn(timepicker.clear, 'emit');

      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(clearSpy).toHaveBeenCalledTimes(0);

      const clearBtn: HTMLElement = document.querySelector(SELECTOR_CLEAR_BTN);
      clearBtn.click();

      fixture.detectChanges();
      flush();

      expect(clearSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Time selection', () => {
    it('should update time', fakeAsync(() => {
      let hour = '10';
      let minute = '52';
      let amPm = 'AM';

      expect(timepickerDirective.value).toBeUndefined();

      timepicker.format12 = true;
      timepickerDirective.value = `${hour}:${minute} ${amPm}`;

      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CURRENT_HOUR).textContent.trim()).toBe(hour);
      expect(document.querySelector(SELECTOR_CURRENT_MINUTE).textContent.trim()).toBe(minute);
      expect(document.querySelector(SELECTOR_AM_BTN).classList.contains('active')).toBe(true);
      expect(document.querySelector(SELECTOR_PM_BTN).classList.contains('active')).toBe(false);

      timepicker.close();
      fixture.detectChanges();
      flush();

      hour = '11';
      minute = '26';
      amPm = 'PM';

      timepickerDirective.value = `${hour}:${minute} ${amPm}`;

      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CURRENT_HOUR).textContent.trim()).toBe(hour);
      expect(document.querySelector(SELECTOR_CURRENT_MINUTE).textContent.trim()).toBe(minute);
      expect(document.querySelector(SELECTOR_AM_BTN).classList.contains('active')).toBe(false);
      expect(document.querySelector(SELECTOR_PM_BTN).classList.contains('active')).toBe(true);

      timepicker.close();
      fixture.detectChanges();
      flush();

      hour = '14';
      minute = '33';
      timepicker.format12 = false;
      timepicker.format24 = true;

      timepickerDirective.value = `${hour}:${minute}`;

      timepicker.open();
      fixture.detectChanges();
      flush();

      expect(document.querySelector(SELECTOR_CURRENT_HOUR).textContent.trim()).toBe(hour);
      expect(document.querySelector(SELECTOR_CURRENT_MINUTE).textContent.trim()).toBe(minute);
      expect(document.querySelector(SELECTOR_AM_BTN)).toBeNull();
      expect(document.querySelector(SELECTOR_PM_BTN)).toBeNull();
    }));

    it('should correctly select time in inline mode', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      testComponent.inline = true;
      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      const hourArrowUp: HTMLElement = document.querySelector(SELECTOR_INLINE_HOUR_ARROW_UP_BTN);
      hourArrowUp.dispatchEvent(new MouseEvent('mousedown'));
      document.dispatchEvent(new MouseEvent('mouseup'));

      const minuteArrowUp: HTMLElement = document.querySelector(
        SELECTOR_INLINE_MINUTE_ARROW_UP_BTN
      );
      minuteArrowUp.dispatchEvent(new MouseEvent('mousedown'));
      document.dispatchEvent(new MouseEvent('mouseup'));

      const pmBtn: HTMLElement = document.querySelector(SELECTOR_PM_BTN);
      pmBtn.click();

      const okBtn: HTMLElement = document.querySelector(SELECTOR_INLINE_OK_BTN);
      okBtn.click();

      fixture.detectChanges();

      expect(timepickerDirective.value).toBe('10:11 PM');
      expect(input.value).toBe('10:11 PM');
    }));

    it('should correctly select time in inline mode when arrow buttons are hold', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      testComponent.inline = true;
      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      const hourArrowUp: HTMLElement = document.querySelector(SELECTOR_INLINE_HOUR_ARROW_UP_BTN);
      hourArrowUp.dispatchEvent(new MouseEvent('mousedown'));
      tick(600); // should add 2 hours
      document.dispatchEvent(new MouseEvent('mouseup'));

      const minuteArrowUp: HTMLElement = document.querySelector(
        SELECTOR_INLINE_MINUTE_ARROW_UP_BTN
      );
      minuteArrowUp.dispatchEvent(new MouseEvent('mousedown'));
      tick(1000); // should add 6 minutes
      document.dispatchEvent(new MouseEvent('mouseup'));

      const pmBtn: HTMLElement = document.querySelector(SELECTOR_PM_BTN);
      pmBtn.click();

      const okBtn: HTMLElement = document.querySelector(SELECTOR_INLINE_OK_BTN);
      okBtn.click();

      fixture.detectChanges();

      expect(timepickerDirective.value).toBe('11:16 PM');
      expect(input.value).toBe('11:16 PM');
    }));

    it('should increase minutes by 5 if increment option is set', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      testComponent.inline = true;
      testComponent.increment = true;

      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      const hourArrowUp: HTMLElement = document.querySelector(SELECTOR_INLINE_HOUR_ARROW_UP_BTN);
      hourArrowUp.dispatchEvent(new MouseEvent('mousedown'));
      document.dispatchEvent(new MouseEvent('mouseup'));

      const minuteArrowUp: HTMLElement = document.querySelector(
        SELECTOR_INLINE_MINUTE_ARROW_UP_BTN
      );
      minuteArrowUp.dispatchEvent(new MouseEvent('mousedown'));
      document.dispatchEvent(new MouseEvent('mouseup'));

      const pmBtn: HTMLElement = document.querySelector(SELECTOR_PM_BTN);
      pmBtn.click();

      const okBtn: HTMLElement = document.querySelector(SELECTOR_INLINE_OK_BTN);
      okBtn.click();

      fixture.detectChanges();

      expect(timepickerDirective.value).toBe('10:15 PM');
      expect(input.value).toBe('10:15 PM');
    }));

    it('should decrease minutes by 5 if increment option is set', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      testComponent.inline = true;
      testComponent.increment = true;

      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      const hourArrowUp: HTMLElement = document.querySelector(SELECTOR_INLINE_HOUR_ARROW_DOWN_BTN);
      hourArrowUp.dispatchEvent(new MouseEvent('mousedown'));
      document.dispatchEvent(new MouseEvent('mouseup'));
      const minuteArrowUp: HTMLElement = document.querySelector(
        SELECTOR_INLINE_MINUTE_ARROW_DOWN_BTN
      );
      minuteArrowUp.dispatchEvent(new MouseEvent('mousedown'));
      document.dispatchEvent(new MouseEvent('mouseup'));

      const pmBtn: HTMLElement = document.querySelector(SELECTOR_PM_BTN);
      pmBtn.click();

      const okBtn: HTMLElement = document.querySelector(SELECTOR_INLINE_OK_BTN);
      okBtn.click();

      fixture.detectChanges();

      expect(timepickerDirective.value).toBe('08:05 PM');
      expect(input.value).toBe('08:05 PM');
    }));
  });

  describe('Hours view keyboard navigation', () => {
    it('should increment hours by 1 on up arrow keydown', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      const currentHour = document.querySelector(SELECTOR_CURRENT_HOUR).parentElement;
      const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
      contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();

      expect(currentHour.textContent.trim()).toBe('10');

      const okBtn: HTMLElement = document.querySelector(SELECTOR_OK_BTN);
      okBtn.click();

      fixture.detectChanges();
      flush();

      expect(timepickerDirective.value).toBe('10:10 AM');
      expect(input.value).toBe('10:10 AM');
    }));

    it('should decrease hours by 1 on down arrow keydown', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      const currentHour = document.querySelector(SELECTOR_CURRENT_HOUR).parentElement;
      const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
      contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(currentHour.textContent.trim()).toBe('08');

      const okBtn: HTMLElement = document.querySelector(SELECTOR_OK_BTN);
      okBtn.click();

      fixture.detectChanges();
      flush();

      expect(timepickerDirective.value).toBe('08:10 AM');
      expect(input.value).toBe('08:10 AM');
    }));

    it('should increment hour by 1 on up arrow keydown in inline mode', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      testComponent.inline = true;
      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      const currentHour = document.querySelector(SELECTOR_CURRENT_HOUR).parentElement;
      const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
      contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();

      expect(currentHour.textContent.trim()).toBe('10');

      const okBtn: HTMLElement = document.querySelector(SELECTOR_INLINE_OK_BTN);
      okBtn.click();

      fixture.detectChanges();
      flush();

      expect(timepickerDirective.value).toBe('10:10 AM');
      expect(input.value).toBe('10:10 AM');
    }));

    it('should increment hour by 1 on up arrow keydown in inline mode', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      testComponent.inline = true;
      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      const currentHour = document.querySelector(SELECTOR_CURRENT_HOUR).parentElement;
      const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
      contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();

      expect(currentHour.textContent.trim()).toBe('10');

      const okBtn: HTMLElement = document.querySelector(SELECTOR_INLINE_OK_BTN);
      okBtn.click();

      fixture.detectChanges();
      flush();

      expect(timepickerDirective.value).toBe('10:10 AM');
      expect(input.value).toBe('10:10 AM');
    }));
  });

  describe('Minutes view keyboard navigation', () => {
    it('should increment minute by 1 on up arrow keydown', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      fixture.detectChanges();

      timepicker.open();

      fixture.detectChanges();
      flush();

      let currentMinute: HTMLElement =
        document.querySelector(SELECTOR_CURRENT_MINUTE).parentElement;
      currentMinute.click();

      fixture.detectChanges();
      flush();

      currentMinute = document.querySelector(SELECTOR_CURRENT_MINUTE).parentElement;
      const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
      contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();

      expect(currentMinute.textContent.trim()).toBe('11');

      const okBtn: HTMLElement = document.querySelector(SELECTOR_OK_BTN);
      okBtn.click();

      fixture.detectChanges();
      flush();

      expect(timepickerDirective.value).toBe('09:11 AM');
      expect(input.value).toBe('09:11 AM');
    }));

    it('should decrease minute by 1 on down arrow keydown', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      let currentMinute: HTMLElement =
        document.querySelector(SELECTOR_CURRENT_MINUTE).parentElement;
      currentMinute.click();

      fixture.detectChanges();
      flush();

      currentMinute = document.querySelector(SELECTOR_CURRENT_MINUTE).parentElement;
      const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
      contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(currentMinute.textContent.trim()).toBe('09');

      const okBtn: HTMLElement = document.querySelector(SELECTOR_OK_BTN);
      okBtn.click();

      fixture.detectChanges();
      flush();

      expect(timepickerDirective.value).toBe('09:09 AM');
      expect(input.value).toBe('09:09 AM');
    }));

    it('should increment minute by 1 on up arrow keydown in inline mode', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      testComponent.inline = true;
      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      let currentMinute: HTMLElement =
        document.querySelector(SELECTOR_CURRENT_MINUTE).parentElement;
      currentMinute.click();

      fixture.detectChanges();
      flush();

      currentMinute = document.querySelector(SELECTOR_CURRENT_MINUTE).parentElement;
      const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
      contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();

      expect(currentMinute.textContent.trim()).toBe('11');

      const okBtn: HTMLElement = document.querySelector(SELECTOR_INLINE_OK_BTN);
      okBtn.click();

      fixture.detectChanges();
      flush();

      expect(timepickerDirective.value).toBe('09:11 AM');
      expect(input.value).toBe('09:11 AM');
    }));

    it('should decrease minute by 1 on up arrow keydown in inline mode', fakeAsync(() => {
      timepickerDirective.value = `09:10 AM`;
      testComponent.inline = true;
      fixture.detectChanges();

      timepicker.open();
      fixture.detectChanges();
      flush();

      let currentMinute: HTMLElement =
        document.querySelector(SELECTOR_CURRENT_MINUTE).parentElement;
      currentMinute.click();

      fixture.detectChanges();
      flush();

      currentMinute = document.querySelector(SELECTOR_CURRENT_MINUTE).parentElement;
      const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
      contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(currentMinute.textContent.trim()).toBe('09');

      const okBtn: HTMLElement = document.querySelector(SELECTOR_INLINE_OK_BTN);
      okBtn.click();

      fixture.detectChanges();
      flush();

      expect(timepickerDirective.value).toBe('09:09 AM');
      expect(input.value).toBe('09:09 AM');
    }));
  });

  describe('rendering custom icon', () => {
    it('should render custom icon if icon input is set', fakeAsync(() => {
      testComponent.icon = 'fas fa-stopwatch';
      fixture.detectChanges();
      flush();

      const iconElement = document.querySelector('.timepicker-icon') as HTMLElement;
      expect(iconElement.classList.contains('fa-stopwatch')).toBe(true);
    }));

    it('should render custom icon if template icon is provided', fakeAsync(() => {
      testComponent.iconTemplate = true;
      fixture.detectChanges();
      flush();

      const iconElement = document.querySelector('.timepicker-icon') as HTMLElement;
      expect(iconElement.classList.contains('fa-angular')).toBe(true);
    }));
  });

  it('should add active class to both arrow icon elements when hour or minute button is hovered in inline mode', fakeAsync(() => {
    testComponent.inline = true;
    fixture.detectChanges();
    timepicker.open();
    fixture.detectChanges();
    flush();

    const hourButtonElement: HTMLButtonElement = overlayContainerElement.querySelector(
      'button.timepicker-current.timepicker-current-inline.timepicker-hour'
    );
    const minuteButtonElement: HTMLButtonElement = overlayContainerElement.querySelector(
      'button.timepicker-current.timepicker-current-inline.timepicker-minute'
    );
    const hourButtonArrowIconElements: NodeListOf<HTMLElement> =
      overlayContainerElement.querySelectorAll('i.timepicker-icon-inline-hour');
    const minuteButtonArrowIconElements: NodeListOf<HTMLElement> =
      overlayContainerElement.querySelectorAll('i.timepicker-icon-inline-minute');

    hourButtonArrowIconElements.forEach((element) => {
      expect(element.classList.contains('active')).toBe(false);
    });

    minuteButtonArrowIconElements.forEach((element) => {
      expect(element.classList.contains('active')).toBe(false);
    });

    hourButtonElement.dispatchEvent(new MouseEvent('mouseover'));
    fixture.detectChanges();
    flush();

    hourButtonArrowIconElements.forEach((element) => {
      expect(element.classList.contains('active')).toBe(true);
    });

    hourButtonElement.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    flush();

    hourButtonArrowIconElements.forEach((element) => {
      expect(element.classList.contains('active')).toBe(false);
    });

    minuteButtonElement.dispatchEvent(new MouseEvent('mouseover'));
    fixture.detectChanges();
    flush();

    minuteButtonArrowIconElements.forEach((element) => {
      expect(element.classList.contains('active')).toBe(true);
    });

    minuteButtonElement.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    flush();

    minuteButtonArrowIconElements.forEach((element) => {
      expect(element.classList.contains('active')).toBe(false);
    });
  }));
});

const TIMEPICKER_WITH_FORM_CONTROL_TEMPLATE = `
<mdb-form-control>
  <input
    mdbInput
    type="text"
    id="exampleTimepicker"
    class="form-control"
    [mdbTimepicker]="timepickerWithFormControl"
    [formControl]="time"
    required
  />
  <label mdbLabel class="form-label" for="exampleTimepicker">Example label</label>
  <mdb-timepicker-toggle [mdbTimepickerToggle]="timepickerWithFormControl"></mdb-timepicker-toggle>
  <mdb-timepicker #timepickerWithFormControl></mdb-timepicker>
</mdb-form-control>
`;

@Component({
  selector: 'mdb-timepicker-with-form-control',
  template: TIMEPICKER_WITH_FORM_CONTROL_TEMPLATE,
  standalone: false,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class TimepickerWithFormControl {
  @ViewChild(MdbTimepickerComponent, { static: true }) timepicker: MdbTimepickerComponent;
  @ViewChild(MdbTimepickerDirective, { static: true }) timepickerDirective: MdbTimepickerDirective;

  startDate = new Date();
  time = new FormControl();

  constructor() {}

  get timeValue() {
    return this.time.value;
  }
}

describe('MDB Timepicker with form control', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<TimepickerWithFormControl>;
  let input: HTMLInputElement;
  let component: TimepickerWithFormControl;
  let timepicker: MdbTimepickerComponent;
  let timepickerDirective: MdbTimepickerDirective;

  function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        MdbTimepickerModule,
        MdbFormsModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      declarations: [component],
      providers: [...providers],
      teardown: { destroyAfterEach: false },
    });

    TestBed.compileComponents();

    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    })();

    return TestBed.createComponent<T>(component);
  }

  beforeEach(() => {
    fixture = createComponent(TimepickerWithFormControl);
    fixture.detectChanges();
    component = fixture.componentInstance;
    timepicker = fixture.componentInstance.timepicker;
    timepickerDirective = component.timepickerDirective;
    input = fixture.debugElement.query(By.css('input')).nativeElement;
  });

  afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
    currentOverlayContainer.ngOnDestroy();
    overlayContainer.ngOnDestroy();
  }));

  it('should update form control value on time selection', fakeAsync(() => {
    expect(component.timeValue).toEqual(null);
    timepicker.open();
    fixture.detectChanges();
    flush();

    const contentElement = overlayContainerElement.querySelector('mdb-timepicker-content');
    contentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    const okBtn: HTMLElement = document.querySelector(SELECTOR_OK_BTN);
    okBtn.click();

    fixture.detectChanges();
    flush();

    expect(component.timeValue).toEqual('11:00 PM');
  }));

  it('should update form control to valid time', fakeAsync(() => {
    expect(component.timeValue).toEqual(null);

    input.value = '06:35 PM';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    flush();

    expect(component.timeValue).toEqual('06:35 PM');

    const componentInstance: any = timepicker;
    expect(componentInstance._value).toEqual('06:35 PM');
  }));
});
