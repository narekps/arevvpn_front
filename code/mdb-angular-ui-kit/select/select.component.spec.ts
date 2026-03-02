import { Component, Provider, Type, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { TestBed, ComponentFixture, inject, fakeAsync, flush, tick } from '@angular/core/testing';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbOptionComponent } from 'mdb-angular-ui-kit/option';
import { MdbSelectComponent, MdbSelectFilterFn } from './select.component';
import { MdbSelectModule } from './select.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DOWN_ARROW, END, ENTER, HOME, TAB, UP_ARROW, SPACE } from '@angular/cdk/keycodes';

function createKeyboardEvent(type: string, keyCode: number, modifier?: string): KeyboardEvent {
  const event = new KeyboardEvent(type);

  Object.defineProperty(event, 'keyCode', {
    get: () => keyCode,
  });

  if (modifier === 'alt') {
    Object.defineProperty(event, 'altKey', {
      get: () => true,
    });
  }

  return event;
}

describe('MDB Select', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        MdbSelectModule,
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

  afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
    currentOverlayContainer.ngOnDestroy();
    overlayContainer.ngOnDestroy();
  }));

  describe('Basic select', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let input: HTMLInputElement;
    let select: MdbSelectComponent;
    let selectEl: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(BasicSelect);
      fixture.detectChanges();
      select = fixture.componentInstance.select;
      selectEl = fixture.debugElement.query(By.css('mdb-select')).nativeElement;
      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    describe('Inputs', () => {
      it('should select highlighted option on tab out in single select when autoSelect input is set to true', fakeAsync(() => {
        fixture.componentInstance.multiple = false;
        fixture.componentInstance.autoSelect = true;
        fixture.detectChanges();

        const options = fixture.componentInstance.options.toArray();

        select.open();
        fixture.detectChanges();
        flush();
        expect(select._isOpen).toBe(true);

        const tabEvent = createKeyboardEvent('keydown', TAB);
        const dropdown = document.querySelector('.select-dropdown-container');
        dropdown.dispatchEvent(tabEvent);
        fixture.detectChanges();
        flush();

        expect(fixture.componentInstance.value).toEqual('one');
        expect(options[0].selected).toBe(true);
      }));

      it('should render clear button if value is selected and clearButton input is set to true', fakeAsync(() => {
        fixture.componentInstance.clearButton = true;
        fixture.detectChanges();

        select.open();
        fixture.detectChanges();
        flush();

        let clearButtonEl: HTMLSpanElement =
          fixture.nativeElement.querySelector('.select-clear-btn');
        const option: HTMLElement = overlayContainerElement.querySelector('mdb-option');

        expect(clearButtonEl).toBeFalsy();

        option.click();
        fixture.detectChanges();
        flush();
        clearButtonEl = fixture.nativeElement.querySelector('.select-clear-btn');

        expect(fixture.componentInstance.value).toEqual('one');
        expect(clearButtonEl).toBeTruthy();
      }));

      it('should clear input value when clear button is clicked', fakeAsync(() => {
        fixture.componentInstance.clearButton = true;
        fixture.detectChanges();

        select.open();
        fixture.detectChanges();
        flush();

        const option: HTMLElement = overlayContainerElement.querySelector('mdb-option');

        option.click();
        fixture.detectChanges();
        flush();

        expect(fixture.componentInstance.value).toEqual('one');

        const clearButtonEl: HTMLSpanElement =
          fixture.nativeElement.querySelector('.select-clear-btn');
        clearButtonEl.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.value).toEqual(null);
      }));

      it('should set proper tabindex attribute value for clear button if clearButtonTabindex input is set', fakeAsync(() => {
        fixture.componentInstance.clearButton = true;
        fixture.detectChanges();

        select.open();
        fixture.detectChanges();
        flush();

        const option: HTMLElement = overlayContainerElement.querySelector('mdb-option');
        option.click();
        fixture.detectChanges();
        flush();

        const clearButtonEl: HTMLSpanElement =
          fixture.nativeElement.querySelector('.select-clear-btn');

        expect(clearButtonEl.tabIndex).toBe(0);

        fixture.componentInstance.clearButtonTabindex = -1;
        fixture.detectChanges();

        expect(clearButtonEl.tabIndex).toBe(-1);
      }));

      it('should not open the dropdown when disabled input is set to true', () => {
        fixture.componentInstance.disabled = true;
        fixture.detectChanges();

        expect(select._isOpen).toBe(false);
        select.open();
        fixture.detectChanges();

        expect(select._isOpen).toBe(false);
      });

      it('should attach disabled attribute to input element when disabled input is set to true', () => {
        expect(input.hasAttribute('disabled')).toBe(false);
        fixture.componentInstance.disabled = true;
        fixture.detectChanges();
        expect(input.hasAttribute('disabled')).toBe(true);
      });

      it('should attach custom class to dropdown element if dropdownClass input is set', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();
        const dropdownElement: HTMLDivElement = overlayContainerElement.querySelector(
          '.select-dropdown-container'
        );

        expect(dropdownElement.classList).not.toContain('custom-dropdown');

        fixture.componentInstance.dropdownClass = 'custom-dropdown';
        fixture.detectChanges();

        expect(dropdownElement.classList).toContain('custom-dropdown');
      }));

      it('should not highlight first option upon opening the dropdown if highlightFirst input is set to false', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        let options: NodeListOf<HTMLElement> =
          overlayContainerElement.querySelectorAll('mdb-option');
        let optionInstances = fixture.componentInstance.options.toArray();

        expect(optionInstances[0].active).toBe(true);
        expect(options[0].classList).toContain('active');

        select.close();
        fixture.detectChanges();
        flush();

        fixture.componentInstance.highlightFirst = false;
        fixture.detectChanges();

        select.open();
        fixture.detectChanges();
        flush();

        options = overlayContainerElement.querySelectorAll('mdb-option');

        expect(optionInstances[0].active).toBe(false);
        expect(options[0].classList).not.toContain('active');
      }));

      it('should display notFoundMsg text if no option is found during filtering', fakeAsync(() => {
        fixture.componentInstance.filter = true;
        fixture.componentInstance.notFoundMsg = 'Test no result message';
        fixture.detectChanges();

        const options = fixture.componentInstance.options.toArray();

        select.open();
        fixture.detectChanges();
        flush();

        const filterInput = overlayContainerElement.querySelector(
          '.select-filter-input'
        ) as HTMLInputElement;

        filterInput.value = 'test input text';
        filterInput.dispatchEvent(new Event('input'));
        tick(300);
        fixture.detectChanges();

        options.forEach((option) => expect(option.hidden).toBe(true));

        const noResultsElement = overlayContainerElement.querySelector('.select-no-results');

        expect(noResultsElement).toBeTruthy();
        expect(noResultsElement.textContent).toEqual('Test no result message');
      }));

      it('should set proper input placeholder attribute if placeholder input is set', () => {
        expect(input.placeholder).toBe('');

        fixture.componentInstance.placeholder = 'Custom placeholder';
        fixture.detectChanges();
        expect(input.placeholder).toBe('Custom placeholder');
      });

      it('should set proper filter input placeholder attribute if filterPlaceholder input is set', fakeAsync(() => {
        fixture.componentInstance.filter = true;
        fixture.detectChanges();

        select.open();
        fixture.detectChanges();
        flush();

        const filterInput: HTMLInputElement =
          overlayContainerElement.querySelector('.select-filter-input');

        expect(filterInput.placeholder).toBe('Search...');

        fixture.componentInstance.filterPlaceholder = 'Custom filter placeholder';
        fixture.detectChanges();

        expect(filterInput.placeholder).toBe('Custom filter placeholder');
      }));

      it('should render filter input element if filter input is set to true', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        let filterInput: HTMLInputElement =
          overlayContainerElement.querySelector('.select-filter-input');

        expect(filterInput).toBeFalsy();

        fixture.componentInstance.filter = true;
        fixture.detectChanges();

        filterInput = overlayContainerElement.querySelector('.select-filter-input');

        expect(filterInput).toBeTruthy();
      }));

      it('should update visible options list when user types in filter input with custom filterFn input', fakeAsync(() => {
        fixture.componentInstance.filter = true;
        fixture.componentInstance.filterFn = (option, filterValue) =>
          option.startsWith(filterValue);
        fixture.detectChanges();

        const options = fixture.componentInstance.options.toArray();

        select.open();
        fixture.detectChanges();
        flush();

        expect(options[0].hidden).toBe(false);
        expect(options[1].hidden).toBe(false);
        expect(options[2].hidden).toBe(false);

        const filterInput = overlayContainerElement.querySelector(
          '.select-filter-input'
        ) as HTMLInputElement;

        filterInput.value = 'o';
        filterInput.dispatchEvent(new Event('input'));
        tick(300);
        fixture.detectChanges();

        expect(options[0].hidden).toBe(false);
        expect(options[1].hidden).toBe(true);
        expect(options[2].hidden).toBe(true);
      }));

      it('should set proper max height style on dropdown container if visibleOptions input is set', fakeAsync(() => {
        fixture.componentInstance.visibleOptions = 4;
        fixture.detectChanges();

        const expectedMaxHeight =
          fixture.componentInstance.visibleOptions * fixture.componentInstance.optionHeight;

        expect(expectedMaxHeight).toBe(4 * 38);

        select.open();
        fixture.detectChanges();
        flush();

        const selectOptionsWrapperElement: HTMLDivElement =
          overlayContainerElement.querySelector('.select-options-wrapper');

        expect(selectOptionsWrapperElement.style.maxHeight).toBe(expectedMaxHeight + 'px');
      }));

      it('should set proper max height style on dropdown container if optionHeight input is set', fakeAsync(() => {
        fixture.componentInstance.optionHeight = 48;
        fixture.detectChanges();

        const expectedMaxHeight =
          fixture.componentInstance.visibleOptions * fixture.componentInstance.optionHeight;

        expect(expectedMaxHeight).toBe(5 * 48);

        select.open();
        fixture.detectChanges();
        flush();

        const selectOptionsWrapperElement: HTMLDivElement =
          overlayContainerElement.querySelector('.select-options-wrapper');

        expect(selectOptionsWrapperElement.style.maxHeight).toBe(expectedMaxHeight + 'px');
      }));

      it('should properly attach id attribute to input elements if inputId is defined', fakeAsync(() => {
        expect(input.hasAttribute('id')).toBe(false);

        fixture.componentInstance.inputId = 'exampleInputId';
        fixture.detectChanges();

        expect(input.hasAttribute('id')).toBe(true);
        expect(input.getAttribute('id')).toBe('exampleInputId');
      }));

      it('should properly attach id attribute to filter input element if inputFilterId input is defined', fakeAsync(() => {
        fixture.componentInstance.filter = true;

        select.open();
        fixture.detectChanges();
        flush();

        const initalFilterInput = overlayContainerElement.querySelector(
          '.select-filter-input'
        ) as HTMLInputElement;

        expect(initalFilterInput.hasAttribute('id')).toBe(false);

        select.close();
        fixture.detectChanges();
        flush();

        fixture.componentInstance.inputFilterId = 'exampleFilterInputId';
        select.open();
        fixture.detectChanges();
        flush();

        const updatedFilterInput = overlayContainerElement.querySelector(
          '.select-filter-input'
        ) as HTMLInputElement;
        expect(updatedFilterInput.hasAttribute('id')).toBe(true);
        expect(updatedFilterInput.getAttribute('id')).toBe('exampleFilterInputId');
      }));

      it('should not apply any additional classes if size input is set to default', () => {
        expect(selectEl.classList).not.toContain('select-lg');
        expect(selectEl.classList).not.toContain('select-sm');
        expect(input.classList).not.toContain('form-control-lg');
        expect(input.classList).not.toContain('form-control-sm');
      });

      it('should add sm classes if size input is set to sm', () => {
        fixture.componentInstance.size = 'sm';
        fixture.detectChanges();
        expect(selectEl.classList).toContain('select-sm');
        expect(input.classList).toContain('form-control-sm');
      });

      it('should add lg classes if size input is set to lg', () => {
        fixture.componentInstance.size = 'lg';
        fixture.detectChanges();
        expect(selectEl.classList).toContain('select-lg');
        expect(input.classList).toContain('form-control-lg');
      });

      it('should set proper tabindex attribute value for input element if tabindex input is set', fakeAsync(() => {
        expect(input.tabIndex).toBe(0);

        fixture.componentInstance.tabindex = 2;
        fixture.detectChanges();

        expect(input.tabIndex).toBe(2);
      }));
    });

    describe('Dropdown opening and closing', () => {
      it('should toggle the dropdown on input click', fakeAsync(() => {
        input.click();
        fixture.detectChanges();
        flush();
        expect(select._isOpen).toBe(true);
        expect(overlayContainerElement.textContent).toContain('One');

        input.click();
        fixture.detectChanges();
        flush();
        expect(select._isOpen).toBe(false);
        expect(overlayContainerElement.textContent).toEqual('');
      }));

      it('should open the dropdown when alt + down arrow keys are pressed', fakeAsync(() => {
        const event = createKeyboardEvent('keydown', DOWN_ARROW, 'alt');
        const selectEl = document.querySelector('mdb-select') as HTMLElement;
        selectEl.dispatchEvent(event);
        fixture.detectChanges();
        flush();

        expect(select._isOpen).toBe(true);
      }));

      it('should open the dropdown when alt + up arrow keys are pressed', fakeAsync(() => {
        const event = createKeyboardEvent('keydown', UP_ARROW, 'alt');
        const selectEl = document.querySelector('mdb-select') as HTMLElement;
        selectEl.dispatchEvent(event);
        fixture.detectChanges();
        flush();

        expect(select._isOpen).toBe(true);
      }));

      it('should open the dropdown programatically', () => {
        expect(select._isOpen).toBe(false);
        select.open();
        fixture.detectChanges();

        expect(select._isOpen).toBe(true);
      });

      it('should close the dropdown programatically', () => {
        select.open();
        fixture.detectChanges();
        expect(select._isOpen).toBe(true);

        select.close();
        fixture.detectChanges();
        expect(select._isOpen).toBe(false);
      });

      it('should close the dropdown when escape key is pressed', fakeAsync(() => {
        input.click();
        fixture.detectChanges();
        flush();
        expect(select._isOpen).toBe(true);

        const escapeEvent = createKeyboardEvent('keydown', 27);
        const dropdown = document.querySelector('.select-dropdown-container') as HTMLElement;
        dropdown.dispatchEvent(escapeEvent);
        fixture.detectChanges();
        flush();

        expect(select._isOpen).toBe(false);
        expect(overlayContainerElement.textContent).toEqual('');
      }));

      it('should close the dropdown when alt + up arrow keys are pressed', fakeAsync(() => {
        input.click();
        fixture.detectChanges();
        flush();
        expect(select._isOpen).toBe(true);

        const event = createKeyboardEvent('keydown', UP_ARROW, 'alt');
        const dropdown = document.querySelector('.select-dropdown-container') as HTMLElement;
        dropdown.dispatchEvent(event);
        fixture.detectChanges();
        flush();

        expect(select._isOpen).toBe(false);
        expect(overlayContainerElement.textContent).toEqual('');
      }));

      it('should close the dropdown when alt + down arrow keys are pressed', fakeAsync(() => {
        input.click();
        fixture.detectChanges();
        flush();
        expect(select._isOpen).toBe(true);

        const event = createKeyboardEvent('keydown', DOWN_ARROW, 'alt');
        const dropdown = document.querySelector('.select-dropdown-container') as HTMLElement;
        dropdown.dispatchEvent(event);
        fixture.detectChanges();
        flush();

        expect(select._isOpen).toBe(false);
        expect(overlayContainerElement.textContent).toEqual('');
      }));

      it('should close the dropdown when clicking outside the component', () => {
        select.open();
        fixture.detectChanges();

        const event = new MouseEvent('click');
        document.dispatchEvent(event);
        fixture.detectChanges();

        expect(select._isOpen).toBe(false);
      });

      it('should close the dropdown when tabbing away from the dropdown', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();
        expect(select._isOpen).toBe(true);

        const tabEvent = createKeyboardEvent('keydown', TAB);
        const dropdown = document.querySelector('.select-dropdown-container');
        dropdown.dispatchEvent(tabEvent);
        fixture.detectChanges();
        flush();

        expect(select._isOpen).toBe(false);
        expect(overlayContainerElement.textContent).toEqual('');
      }));

      it('should close the dropdown when single option is clicked', () => {
        select.open();
        fixture.detectChanges();

        const option = overlayContainerElement.querySelector('mdb-option') as HTMLElement;
        option.click();
        fixture.detectChanges();

        expect(select._isOpen).toBe(false);
      });
    });

    describe('Selection', () => {
      it('should select option when its clicked', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        let option = overlayContainerElement.querySelector('mdb-option') as HTMLElement;

        option.click();
        fixture.detectChanges();
        flush();

        select.open();
        fixture.detectChanges();
        flush();

        option = overlayContainerElement.querySelector('mdb-option') as HTMLElement;

        expect(option.classList).toContain('selected');
        expect(fixture.componentInstance.options.first.selected).toBe(true);
      }));

      it('should not select disabled option', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        let options = overlayContainerElement.querySelectorAll(
          'mdb-option'
        ) as NodeListOf<HTMLElement>;

        options[3].click();
        fixture.detectChanges();
        flush();

        select.open();
        fixture.detectChanges();
        flush();

        options = overlayContainerElement.querySelectorAll('mdb-option') as NodeListOf<HTMLElement>;

        expect(options[3].classList).not.toContain('selected');
        const optionInstances = fixture.componentInstance.options.toArray();
        expect(optionInstances[3].selected).toBe(false);
      }));

      it('should deselect other options on option click in single mode', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        let options = overlayContainerElement.querySelectorAll(
          'mdb-option'
        ) as NodeListOf<HTMLElement>;

        options[1].click();
        fixture.detectChanges();

        expect(options[1].classList).toContain('selected');

        options[0].click();
        fixture.detectChanges();
        flush();

        select.open();
        fixture.detectChanges();
        flush();

        options = overlayContainerElement.querySelectorAll('mdb-option') as NodeListOf<HTMLElement>;
        expect(options[1].classList).not.toContain('selected');

        const optionInstances = fixture.componentInstance.options.toArray();
        expect(optionInstances[1].selected).toBe(false);
      }));

      it('should display selected option in input', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        const option = overlayContainerElement.querySelector('mdb-option') as HTMLElement;
        const selectInput = document.querySelector('.select-input') as HTMLInputElement;

        option.click();
        fixture.detectChanges();
        flush();

        expect(selectInput.value).toBe(' One ');
      }));

      it('should use value from ngModel to set default selected value', fakeAsync(() => {
        expect(fixture.componentInstance.value).toBe(null);

        fixture.componentInstance.value = 'one';
        fixture.detectChanges();

        flush();
        fixture.detectChanges();

        const options = fixture.componentInstance.options.toArray();
        const selectInput = document.querySelector('.select-input') as HTMLInputElement;

        expect(options[0].selected).toBe(true);
        expect(selectInput.value).toBe(' One ');
      }));

      it('should update ngModel value when option is selected', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        const option = overlayContainerElement.querySelector('mdb-option') as HTMLElement;

        option.click();
        fixture.detectChanges();
        flush();

        expect(fixture.componentInstance.value).toEqual('one');
      }));
    });

    describe('Events', () => {
      it('should emit opened event when dropdown is opened and closed event when dropdown is closed', fakeAsync(() => {
        const openSpy = jest.spyOn(select.opened, 'emit');
        const closeSpy = jest.spyOn(select.closed, 'emit');

        select.open();
        fixture.detectChanges();
        flush();

        expect(openSpy).toHaveBeenCalledTimes(1);

        select.close();
        fixture.detectChanges();

        expect(closeSpy).toHaveBeenCalledTimes(1);
      }));

      it('should emit search event on input in _filterInput', fakeAsync(() => {
        fixture.componentInstance.filter = true;
        fixture.detectChanges();

        const searchSpy = jest.spyOn(select.search, 'emit');

        select.open();
        fixture.detectChanges();
        flush();

        const filterInput = overlayContainerElement.querySelector(
          '.select-filter-input'
        ) as HTMLInputElement;

        filterInput.value = 'One';
        filterInput.dispatchEvent(new Event('input'));
        tick(300);
        fixture.detectChanges();

        expect(searchSpy).toHaveBeenCalledTimes(1);
      }));

      it('should emit selected event when new option is selected and deselected when another option is selected', fakeAsync(() => {
        const selectedSpy = jest.spyOn(select.selected, 'emit');
        const deselectedSpy = jest.spyOn(select.deselected, 'emit');
        let selectedValue: any;
        let deselectedValue: any;
        select.selected.subscribe((event) => (selectedValue = event));
        select.deselected.subscribe((event) => (deselectedValue = event));

        select.open();
        fixture.detectChanges();
        flush();

        expect(selectedSpy).toHaveBeenCalledTimes(0);
        expect(deselectedSpy).toHaveBeenCalledTimes(0);
        expect(selectedValue).toBe(undefined);
        expect(deselectedValue).toBe(undefined);

        const options: NodeListOf<HTMLElement> =
          overlayContainerElement.querySelectorAll('mdb-option');

        options[0].click();
        fixture.detectChanges();

        expect(selectedSpy).toHaveBeenCalledTimes(1);
        expect(deselectedSpy).toHaveBeenCalledTimes(0);
        expect(selectedValue).toBe('one');
        expect(deselectedValue).toBe(undefined);

        options[1].click();
        fixture.detectChanges();

        expect(selectedSpy).toHaveBeenCalledTimes(2);
        expect(deselectedSpy).toHaveBeenCalledTimes(1);
        expect(selectedValue).toBe('two');
        expect(deselectedValue).toBe('one');
      }));

      it('should emit valueChange event when an option is selected', fakeAsync(() => {
        const valueChangeSpy = jest.spyOn(select.valueChange, 'emit');

        let valueChangeValue: any;
        select.valueChange.subscribe((event) => (valueChangeValue = event));

        select.open();
        fixture.detectChanges();
        flush();

        expect(valueChangeSpy).toHaveBeenCalledTimes(0);
        expect(valueChangeValue).toBe(undefined);

        const options: NodeListOf<HTMLElement> =
          overlayContainerElement.querySelectorAll('mdb-option');

        options[0].click();
        fixture.detectChanges();

        expect(valueChangeSpy).toHaveBeenCalledTimes(1);
        expect(valueChangeValue).toBe('one');

        options[1].click();
        fixture.detectChanges();

        expect(valueChangeSpy).toHaveBeenCalledTimes(2);
        expect(valueChangeValue).toBe('two');
      }));
    });

    describe('Keyboard navigation', () => {
      it('should highlight next option when down arrow key is pressed', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        const options = overlayContainerElement.querySelectorAll(
          'mdb-option'
        ) as NodeListOf<HTMLElement>;

        const optionInstances = fixture.componentInstance.options.toArray();

        expect(optionInstances[0].active).toBe(true);
        expect(options[0].classList).toContain('active');

        const event = createKeyboardEvent('keydown', DOWN_ARROW);
        const dropdown = document.querySelector('.select-dropdown-container');
        dropdown.dispatchEvent(event);

        fixture.detectChanges();

        expect(optionInstances[1].active).toBe(true);
        expect(options[1].classList).toContain('active');
      }));

      it('should highlight previous option when up arrow key is pressed', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        const options = overlayContainerElement.querySelectorAll(
          'mdb-option'
        ) as NodeListOf<HTMLElement>;
        const optionInstances = fixture.componentInstance.options.toArray();
        const dropdown = document.querySelector('.select-dropdown-container');

        const downArrowEvent = createKeyboardEvent('keydown', DOWN_ARROW);
        const upArrowEvent = createKeyboardEvent('keydown', UP_ARROW);
        dropdown.dispatchEvent(downArrowEvent);

        fixture.detectChanges();

        expect(optionInstances[1].active).toBe(true);
        expect(options[1].classList).toContain('active');

        dropdown.dispatchEvent(upArrowEvent);
        fixture.detectChanges();

        expect(optionInstances[0].active).toBe(true);
        expect(options[0].classList).toContain('active');
      }));

      it('should highlight first option when home key is pressed', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        const options = overlayContainerElement.querySelectorAll(
          'mdb-option'
        ) as NodeListOf<HTMLElement>;
        const optionInstances = fixture.componentInstance.options.toArray();
        const dropdown = document.querySelector('.select-dropdown-container');

        const downArrowEvent = createKeyboardEvent('keydown', DOWN_ARROW);
        const homeEvent = createKeyboardEvent('keydown', HOME);
        dropdown.dispatchEvent(downArrowEvent);
        dropdown.dispatchEvent(downArrowEvent);

        fixture.detectChanges();

        expect(optionInstances[2].active).toBe(true);
        expect(options[2].classList).toContain('active');

        dropdown.dispatchEvent(homeEvent);
        fixture.detectChanges();

        expect(optionInstances[0].active).toBe(true);
        expect(options[0].classList).toContain('active');
      }));

      it('should highlight last option when end key is pressed', fakeAsync(() => {
        select.open();
        fixture.detectChanges();
        flush();

        const options = overlayContainerElement.querySelectorAll(
          'mdb-option'
        ) as NodeListOf<HTMLElement>;
        const optionInstances = fixture.componentInstance.options.toArray();
        const dropdown = document.querySelector('.select-dropdown-container');

        const endEvent = createKeyboardEvent('keydown', END);

        dropdown.dispatchEvent(endEvent);
        fixture.detectChanges();

        expect(optionInstances[5].active).toBe(true);
        expect(options[5].classList).toContain('active');
      }));
    });

    describe('Filter', () => {
      it('should update visible options list when user types in filter input', fakeAsync(() => {
        fixture.componentInstance.filter = true;
        fixture.detectChanges();

        const options = fixture.componentInstance.options.toArray();

        select.open();
        fixture.detectChanges();
        flush();

        expect(options[0].hidden).toBe(false);
        expect(options[1].hidden).toBe(false);
        expect(options[2].hidden).toBe(false);

        const filterInput = overlayContainerElement.querySelector(
          '.select-filter-input'
        ) as HTMLInputElement;

        filterInput.value = 'One';
        filterInput.dispatchEvent(new Event('input'));
        tick(300);
        fixture.detectChanges();

        expect(options[0].hidden).toBe(false);
        expect(options[1].hidden).toBe(true);
        expect(options[2].hidden).toBe(true);
      }));

      it('should properly allow to navigate by keyboard after filtering', fakeAsync(() => {
        fixture.componentInstance.filter = true;
        fixture.detectChanges();

        select.open();
        fixture.detectChanges();
        flush();

        const options = overlayContainerElement.querySelectorAll(
          'mdb-option'
        ) as NodeListOf<HTMLElement>;

        const optionInstances = fixture.componentInstance.options.toArray();

        expect(optionInstances[0].active).toBe(true);
        expect(options[0].classList).toContain('active');

        const searchEl = document.querySelector('.select-filter-input') as HTMLInputElement;
        const eventInput = new Event('input');
        searchEl.value = 's';
        searchEl.dispatchEvent(eventInput);

        tick(300);
        fixture.detectChanges();

        expect(optionInstances[5].active).toBe(false);
        expect(options[5].classList).not.toContain('active');

        const dropdown = document.querySelector('.select-dropdown-container');
        const downArrowEvent = createKeyboardEvent('keydown', DOWN_ARROW);
        dropdown.dispatchEvent(downArrowEvent);
        fixture.detectChanges();

        expect(optionInstances[5].active).toBe(true);
        expect(options[5].classList).toContain('active');

        select.close();
        fixture.detectChanges();
        flush();

        select.open();
        fixture.detectChanges();
        flush();

        dropdown.dispatchEvent(downArrowEvent);
        fixture.detectChanges();

        expect(optionInstances[5].active).toBe(false);
        expect(options[5].classList).not.toContain('active');
        expect(optionInstances[1].active).toBe(true);
        expect(options[1].classList).toContain('active');
      }));
    });

    it('should set proper max-height style on dropdown wrapper element', fakeAsync(() => {
      const defaultMaxHeight =
        fixture.componentInstance.optionHeight * fixture.componentInstance.visibleOptions;
      expect(defaultMaxHeight).toBe(190);
      select.open();
      fixture.detectChanges();
      flush();

      const selectOptionsWrapperElement: HTMLDivElement =
        overlayContainerElement.querySelector('.select-options-wrapper');

      expect(selectOptionsWrapperElement.style.maxHeight).toBe(defaultMaxHeight + 'px');
    }));
  });

  describe('Form control integration', () => {
    let fixture: ComponentFixture<SelectWithFormControl>;
    let input: HTMLElement;
    let select: MdbSelectComponent;

    beforeEach(() => {
      fixture = createComponent(SelectWithFormControl);
      fixture.detectChanges();
      select = fixture.componentInstance.select;
      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should use value from Form Control to set default selected value', fakeAsync(() => {
      fixture.componentInstance.control = new UntypedFormControl('one');
      fixture.detectChanges();

      flush();
      fixture.detectChanges();

      const options = fixture.componentInstance.options.toArray();
      const selectInput = document.querySelector('.select-input') as HTMLInputElement;

      expect(options[0].selected).toBe(true);
      expect(selectInput.value).toBe(' One ');
    }));

    it('should update form control value when new option is selected', fakeAsync(() => {
      select.open();
      fixture.detectChanges();
      flush();

      const option = overlayContainerElement.querySelector('mdb-option') as HTMLElement;

      expect(fixture.componentInstance.control.value).toEqual(null);

      option.click();
      fixture.detectChanges();
      flush();

      expect(fixture.componentInstance.control.value).toEqual('one');
    }));
  });

  describe('Options groups', () => {
    let fixture: ComponentFixture<SelectWithOptionsGroups>;
    let select: MdbSelectComponent;

    beforeEach(() => {
      fixture = createComponent(SelectWithOptionsGroups);
      fixture.detectChanges();
      select = fixture.componentInstance.select;
    });

    it('should disable all options inside disabled option group', fakeAsync(() => {
      select.open();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      const disabledGroup = overlayContainerElement.querySelectorAll('mdb-option-group')[1];
      const disabledGroupOptions = disabledGroup.querySelectorAll(
        'mdb-option'
      ) as NodeListOf<HTMLElement>;

      disabledGroupOptions.forEach((option) => {
        expect(option.classList).toContain('disabled');
      });
    }));

    it('should hide filtered out group', fakeAsync(() => {
      fixture.componentInstance.filter = true;
      fixture.detectChanges();

      expect(select._isOpen).toBe(false);
      select.open();
      fixture.detectChanges();
      flush();

      const filterInput = overlayContainerElement.querySelector(
        '.select-filter-input'
      ) as HTMLInputElement;

      filterInput.value = 'Four';
      filterInput.dispatchEvent(new Event('input'));

      tick(300);
      fixture.detectChanges();

      const optionGroup = overlayContainerElement.querySelectorAll('mdb-option-group');
      expect(optionGroup[0].classList).toContain('d-none');
      expect(optionGroup[1].classList).not.toContain('d-none');
    }));
  });

  describe('Keyboard navigation on closed dropdown', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let select: MdbSelectComponent;
    let selectEl: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(BasicSelect);
      fixture.detectChanges();
      select = fixture.componentInstance.select;
      selectEl = fixture.debugElement.query(By.css('mdb-select')).nativeElement;
    });

    it('should select options using arrow down and arrow up keys', () => {
      const downArrowEvent = createKeyboardEvent('keydown', DOWN_ARROW);
      const upArrowEvent = createKeyboardEvent('keydown', UP_ARROW);
      const options = fixture.componentInstance.options.toArray();

      selectEl.dispatchEvent(downArrowEvent);
      fixture.detectChanges();

      expect(options[0].selected).toBe(true);
      expect(fixture.componentInstance.value).toEqual('one');

      selectEl.dispatchEvent(downArrowEvent);
      selectEl.dispatchEvent(downArrowEvent);
      fixture.detectChanges();

      expect(options[2].selected).toBe(true);
      expect(fixture.componentInstance.value).toEqual('three');

      selectEl.dispatchEvent(upArrowEvent);
      fixture.detectChanges();

      expect(options[1].selected).toBe(true);
      expect(fixture.componentInstance.value).toEqual('two');
    });

    it('should select first option using HOME key', () => {
      const homeEvent = createKeyboardEvent('keydown', HOME);
      const options = fixture.componentInstance.options.toArray();

      selectEl.dispatchEvent(homeEvent);
      fixture.detectChanges();

      expect(options[0].selected).toBe(true);
      expect(fixture.componentInstance.value).toEqual('one');
    });

    it('should select last option using END key', () => {
      const endEvent = createKeyboardEvent('keydown', END);
      const options = fixture.componentInstance.options.toArray();
      const lastOptionIndex = options.length - 1;

      selectEl.dispatchEvent(endEvent);
      fixture.detectChanges();

      expect(options[lastOptionIndex].selected).toBe(true);
      expect(fixture.componentInstance.value).toEqual('six');
    });

    it('should open dropdown using enter key', fakeAsync(() => {
      expect(select._isOpen).toBe(false);

      const enterEvent = createKeyboardEvent('keydown', ENTER);

      selectEl.dispatchEvent(enterEvent);
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.textContent).toContain('One');
    }));

    it('should open dropdown using space key', fakeAsync(() => {
      expect(select._isOpen).toBe(false);

      const spaceEvent = createKeyboardEvent('keydown', SPACE);

      selectEl.dispatchEvent(spaceEvent);
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.textContent).toContain('One');
    }));

    it('should open dropdown on arrow down key in multiple mode', fakeAsync(() => {
      fixture.componentInstance.multiple = true;
      fixture.detectChanges();

      expect(select._isOpen).toBe(false);

      const downArrowEvent = createKeyboardEvent('keydown', DOWN_ARROW);

      selectEl.dispatchEvent(downArrowEvent);
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.textContent).toContain('One');
    }));

    it('should open dropdown on arrow up key in multiple mode', fakeAsync(() => {
      fixture.componentInstance.multiple = true;
      fixture.detectChanges();

      expect(select._isOpen).toBe(false);

      const downArrowEvent = createKeyboardEvent('keydown', DOWN_ARROW);

      selectEl.dispatchEvent(downArrowEvent);
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.textContent).toContain('One');
    }));
  });

  describe('Filtering and selection', () => {
    let fixture: ComponentFixture<SelectFilterMultiple>;
    let select: MdbSelectComponent;

    beforeEach(() => {
      fixture = createComponent(SelectFilterMultiple);
      fixture.detectChanges();
      select = fixture.componentInstance.select;
    });

    it('should select only filtered options when using select all option', fakeAsync(() => {
      select.open();
      fixture.detectChanges();
      flush();

      const filterInput = overlayContainerElement.querySelector(
        '.select-filter-input'
      ) as HTMLInputElement;

      filterInput.value = 'One';
      filterInput.dispatchEvent(new Event('input'));
      tick(300);
      fixture.detectChanges();

      let selectAllOption = overlayContainerElement.querySelector(
        'mdb-select-all-option'
      ) as HTMLElement;

      selectAllOption.click();
      fixture.detectChanges();
      flush();

      const options = fixture.componentInstance.options.toArray();
      const selectInput = document.querySelector('.select-input') as HTMLInputElement;

      expect(selectAllOption.classList).toContain('selected');
      expect(selectInput.value).toBe('One');
      expect(options[0].selected).toBe(true);
      expect(options[1].selected).toBe(false);
    }));

    it('should update select all option state when option list change during filtering', fakeAsync(() => {
      select.open();
      fixture.detectChanges();
      flush();

      const filterInput = overlayContainerElement.querySelector(
        '.select-filter-input'
      ) as HTMLInputElement;

      filterInput.value = 'One';
      filterInput.dispatchEvent(new Event('input'));
      tick(300);
      fixture.detectChanges();

      let selectAllOption = overlayContainerElement.querySelector(
        'mdb-select-all-option'
      ) as HTMLElement;

      selectAllOption.click();
      fixture.detectChanges();
      flush();

      expect(selectAllOption.classList).toContain('selected');

      filterInput.value = '';
      filterInput.dispatchEvent(new Event('input'));
      tick(300);
      fixture.detectChanges();

      expect(selectAllOption.classList).not.toContain('selected');
    }));
  });

  describe('Multi select', () => {
    let fixture: ComponentFixture<MutliSelectComponent>;
    let input: HTMLInputElement;
    let select: MdbSelectComponent;

    beforeEach(() => {
      fixture = createComponent(MutliSelectComponent);
      select = fixture.componentInstance.select;
      input = fixture.debugElement.query(By.css('input')).nativeElement;
      fixture.detectChanges();
    });

    it('should allow selection of multiple options', fakeAsync(() => {
      select.open();
      fixture.detectChanges();
      flush();

      const optionElements: NodeListOf<HTMLElement> =
        overlayContainerElement.querySelectorAll('mdb-option');

      expect(input.value).toBe('');
      expect(optionElements[0].classList).not.toContain('selected');
      expect(optionElements[1].classList).not.toContain('selected');
      expect(optionElements[2].classList).not.toContain('selected');
      expect(optionElements[3].classList).not.toContain('selected');
      expect(optionElements[4].classList).not.toContain('selected');
      expect(optionElements[5].classList).not.toContain('selected');
      expect(optionElements[6].classList).not.toContain('selected');
      expect(optionElements[7].classList).not.toContain('selected');

      optionElements[0].click();
      optionElements[1].click();
      optionElements[2].click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('One, Two, Three');
      expect(optionElements[0].classList).toContain('selected');
      expect(optionElements[1].classList).toContain('selected');
      expect(optionElements[2].classList).toContain('selected');
      expect(optionElements[3].classList).not.toContain('selected');
      expect(optionElements[4].classList).not.toContain('selected');
      expect(optionElements[5].classList).not.toContain('selected');
      expect(optionElements[6].classList).not.toContain('selected');
      expect(optionElements[7].classList).not.toContain('selected');
    }));

    it('should select all options if Select All option is clicked', fakeAsync(() => {
      select.open();
      fixture.detectChanges();
      flush();

      const optionElements: NodeListOf<HTMLElement> =
        overlayContainerElement.querySelectorAll('mdb-option');
      const selectAllOptionElement: HTMLElement =
        overlayContainerElement.querySelector('mdb-select-all-option');
      expect(input.value).toBe('');
      expect(optionElements[0].classList).not.toContain('selected');
      expect(optionElements[1].classList).not.toContain('selected');
      expect(optionElements[2].classList).not.toContain('selected');
      expect(optionElements[3].classList).not.toContain('selected');
      expect(optionElements[4].classList).not.toContain('selected');
      expect(optionElements[5].classList).not.toContain('selected');
      expect(optionElements[6].classList).not.toContain('selected');
      expect(optionElements[7].classList).not.toContain('selected');

      selectAllOptionElement.click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('8 options selected');
      expect(optionElements[0].classList).toContain('selected');
      expect(optionElements[1].classList).toContain('selected');
      expect(optionElements[2].classList).toContain('selected');
      expect(optionElements[3].classList).toContain('selected');
      expect(optionElements[4].classList).toContain('selected');
      expect(optionElements[5].classList).toContain('selected');
      expect(optionElements[6].classList).toContain('selected');
      expect(optionElements[7].classList).toContain('selected');
    }));

    it('should display proper amount of selections in input if displayedLabels input is set', fakeAsync(() => {
      select.open();
      fixture.detectChanges();
      flush();

      const optionElements: NodeListOf<HTMLElement> =
        overlayContainerElement.querySelectorAll('mdb-option');

      expect(input.value).toBe('');

      optionElements[0].click();
      optionElements[1].click();
      optionElements[2].click();
      optionElements[3].click();
      optionElements[4].click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('One, Two, Three, Four, Five');

      optionElements[5].click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('6 options selected');

      fixture.componentInstance.displayedLabels = 6;
      fixture.detectChanges();

      expect(input.value).toBe('One, Two, Three, Four, Five, Six');

      optionElements[6].click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('7 options selected');
    }));

    it('should display proper text if optionsSelectedLabel input is set', fakeAsync(() => {
      select.open();
      fixture.detectChanges();
      flush();

      const optionElements: NodeListOf<HTMLElement> =
        overlayContainerElement.querySelectorAll('mdb-option');

      expect(input.value).toBe('');

      optionElements[0].click();
      optionElements[1].click();
      optionElements[2].click();
      optionElements[3].click();
      optionElements[4].click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('One, Two, Three, Four, Five');

      optionElements[5].click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('6 options selected');

      fixture.componentInstance.optionsSelectedLabel = 'opcji zaznaczonych';
      fixture.detectChanges();

      expect(input.value).toBe('6 opcji zaznaczonych');
    }));

    it('should sort displayed selections in proper order if sortComparator input is set', fakeAsync(() => {
      select.open();
      fixture.detectChanges();
      flush();

      const optionElements: NodeListOf<HTMLElement> =
        overlayContainerElement.querySelectorAll('mdb-option');

      expect(input.value).toBe('');

      optionElements[3].click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('Four');

      optionElements[0].click();
      optionElements[2].click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('One, Three, Four');

      fixture.componentInstance.sortComparator = (a, b, options) =>
        options.indexOf(b) - options.indexOf(a);
      fixture.detectChanges();

      optionElements[5].click();
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('Six, Four, Three, One');
    }));
  });
});

@Component({
  selector: 'mdb-basic-select',
  template: `
    <mdb-form-control>
      <mdb-select
        [filter]="filter"
        [filterFn]="filterFn"
        [notFoundMsg]="notFoundMsg"
        [multiple]="multiple"
        [autoSelect]="autoSelect"
        [(ngModel)]="value"
        [inputId]="inputId"
        [inputFilterId]="inputFilterId"
        [clearButton]="clearButton"
        [clearButtonTabindex]="clearButtonTabindex"
        [tabindex]="tabindex"
        [optionHeight]="optionHeight"
        [disabled]="disabled"
        [visibleOptions]="visibleOptions"
        [dropdownClass]="dropdownClass"
        [highlightFirst]="highlightFirst"
        [placeholder]="placeholder"
        [filterPlaceholder]="filterPlaceholder"
        [size]="size"
      >
        <mdb-option
          *ngFor="let number of numbers"
          [value]="number.value"
          [disabled]="number.disabled"
        >
          {{ number.label }}
        </mdb-option>
      </mdb-select>
    </mdb-form-control>
  `,
  standalone: false,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
class BasicSelect {
  numbers: any[] = [
    { value: 'one', label: 'One', disabled: false },
    { value: 'two', label: 'Two', disabled: false },
    { value: 'three', label: 'Three', disabled: false },
    { value: 'four', label: 'Four', disabled: true },
    { value: 'five', label: 'Five', disabled: false },
    { value: 'six', label: 'Six', disabled: false },
  ];

  value = null;

  filter = false;
  filterFn: MdbSelectFilterFn = (option, filterValue) => option.includes(filterValue);

  @ViewChild(MdbSelectComponent, { static: true }) select: MdbSelectComponent;
  @ViewChildren(MdbOptionComponent) options: QueryList<MdbOptionComponent>;

  autoSelect = false;
  clearButton = false;
  tabindex = 0;
  clearButtonTabindex = 0;
  disabled = false;
  dropdownClass: string;
  optionHeight = 38;
  visibleOptions = 5;
  highlightFirst = true;
  placeholder = '';
  filterPlaceholder = 'Search...';
  multiple = false;
  notFoundMsg = 'No results found';
  inputId: string | undefined;
  inputFilterId: string | undefined;
  size = 'default';
}

@Component({
  selector: 'mdb-multi-select',
  template: `
    <mdb-form-control>
      <mdb-select
        [multiple]="multiple"
        [displayedLabels]="displayedLabels"
        [optionsSelectedLabel]="optionsSelectedLabel"
        [sortComparator]="sortComparator"
      >
        <mdb-select-all-option>Select all</mdb-select-all-option>
        <mdb-option *ngFor="let number of numbers" [value]="number.value">{{
          number.label
        }}</mdb-option>
      </mdb-select>
      <label mdbLabel class="form-label">Example label</label>
    </mdb-form-control>
  `,
  standalone: false,
})
class MutliSelectComponent {
  @ViewChild(MdbSelectComponent, { static: true }) select: MdbSelectComponent;
  @ViewChildren(MdbOptionComponent) options: QueryList<MdbOptionComponent>;
  multiple = true;
  displayedLabels = 5;
  optionsSelectedLabel = 'options selected';
  sortComparator: (
    a: MdbOptionComponent,
    b: MdbOptionComponent,
    options: MdbOptionComponent[]
  ) => number;

  numbers = [
    { value: '1', label: 'One' },
    { value: '2', label: 'Two' },
    { value: '3', label: 'Three' },
    { value: '4', label: 'Four' },
    { value: '5', label: 'Five' },
    { value: '6', label: 'Six' },
    { value: '7', label: 'Seven' },
    { value: '8', label: 'Eigth' },
  ];
}

@Component({
  selector: 'mdb-select-filter-multiple',
  template: `
    <mdb-form-control>
      <mdb-select
        [filter]="filter"
        [notFoundMsg]="notFoundMsg"
        [multiple]="multiple"
        [autoSelect]="autoSelect"
        [(ngModel)]="value"
      >
        <mdb-select-all-option></mdb-select-all-option>
        <mdb-option
          *ngFor="let number of numbers"
          [value]="number.value"
          [disabled]="number.disabled"
        >
          {{ number.label }}
        </mdb-option>
      </mdb-select>
    </mdb-form-control>
  `,
  standalone: false,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
class SelectFilterMultiple {
  numbers: any[] = [
    { value: 'one', label: 'One', disabled: false },
    { value: 'two', label: 'Two', disabled: false },
    { value: 'three', label: 'Three', disabled: false },
    { value: 'four', label: 'Four', disabled: false },
    { value: 'five', label: 'Five', disabled: false },
    { value: 'six', label: 'Six', disabled: false },
  ];

  value = null;

  filter = true;
  @ViewChild(MdbSelectComponent, { static: true }) select: MdbSelectComponent;
  @ViewChildren(MdbOptionComponent) options: QueryList<MdbOptionComponent>;

  multiple = true;
  notFoundMsg = 'No results found';
  autoSelect = false;
}

const SELECT_WITH_FORM_CONTROL_TEMPLATE = `
<mdb-form-control>
  <mdb-select
    [multiple]="multiple"
    [formControl]="control"
  >
    <mdb-option
      *ngFor="let number of numbers"
      [value]="number.value"
      [disabled]="number.disabled"
    >
      {{ number.label }}
    </mdb-option>
  </mdb-select>
</mdb-form-control>
`;

@Component({
  selector: 'mdb-select-with-form-control',
  template: SELECT_WITH_FORM_CONTROL_TEMPLATE,
  standalone: false,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
class SelectWithFormControl {
  numbers: any[] = [
    { value: 'one', label: 'One', disabled: false },
    { value: 'two', label: 'Two', disabled: false },
    { value: 'three', label: 'Three', disabled: false },
    { value: 'four', label: 'Four', disabled: true },
    { value: 'five', label: 'Five', disabled: false },
    { value: 'six', label: 'Six', disabled: false },
  ];

  control = new UntypedFormControl();

  @ViewChild(MdbSelectComponent, { static: true }) select: MdbSelectComponent;
  @ViewChildren(MdbOptionComponent) options: QueryList<MdbOptionComponent>;

  multiple = false;
}

const SELECT_WITH_OPTIONS_GROUPS_TEMPLATE = `
<mdb-form-control>
  <mdb-select [filter]="filter">
    <mdb-option-group *ngFor="let group of groups" [label]="group.name" [disabled]="group.disabled">
      <mdb-option *ngFor="let option of group.options" [value]="option.value">{{
        option.label
      }}</mdb-option>
    </mdb-option-group>
  </mdb-select>
  <label mdbLabel class="form-label">Example label</label>
</mdb-form-control>
`;

@Component({
  selector: 'mdb-select-with-options-groups',
  template: SELECT_WITH_OPTIONS_GROUPS_TEMPLATE,
  standalone: false,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
class SelectWithOptionsGroups {
  groups = [
    {
      name: 'Label 1',
      disabled: false,
      options: [
        { value: 'first-group-1', label: 'One' },
        { value: 'first-group-2', label: 'Two' },
        { value: 'first-group-3', label: 'Three' },
      ],
    },
    {
      name: 'Label 2',
      disabled: true,
      options: [
        { value: 'second-group-4', label: 'Four' },
        { value: 'second-group-5', label: 'Five' },
        { value: 'second-group-6', label: 'Six' },
      ],
    },
  ];
  filter = false;

  @ViewChild(MdbSelectComponent, { static: true }) select: MdbSelectComponent;
  @ViewChildren(MdbOptionComponent) options: QueryList<MdbOptionComponent>;
}
