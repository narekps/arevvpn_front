import { TestBed, ComponentFixture, flush, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement, Provider, Type } from '@angular/core';
import { MdbSidenavModule } from './sidenav.module';
import { Component } from '@angular/core';
import { MdbSidenavComponent } from './sidenav.component';
import { MdbSidenavItemComponent } from './sidenav-item.component';
import { MdbCollapseModule } from '../collapse/collapse.module';
import { MdbCollapseDirective } from '../collapse';
import { By } from '@angular/platform-browser';

describe('MDB Sidenav', () => {
  let fixture: ComponentFixture<TestSidenavComponent>;
  let testComponent: TestSidenavComponent;
  let sidenavComponent: MdbSidenavComponent;
  let firstCollapseEl: HTMLAnchorElement;
  let secondCollapseEl: HTMLAnchorElement;
  let sidenavToggleEl: HTMLButtonElement;
  let sidenavEl: HTMLElement;
  let collapseElements: HTMLUListElement[];

  function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [MdbSidenavModule, MdbCollapseModule],
      declarations: [component],
      providers: [...providers],
      teardown: { destroyAfterEach: false },
    });

    TestBed.compileComponents();

    return TestBed.createComponent<T>(component);
  }

  beforeEach(() => {
    fixture = createComponent(TestSidenavComponent);
    fixture.detectChanges();
    testComponent = fixture.componentInstance;
    sidenavComponent = fixture.debugElement.query(By.css('mdb-sidenav')).componentInstance;
    firstCollapseEl = fixture.debugElement.query(By.css('[data-testid="collapse1"]')).nativeElement;
    secondCollapseEl = fixture.debugElement.query(
      By.css('[data-testid="collapse2"]')
    ).nativeElement;
    sidenavToggleEl = fixture.debugElement.query(By.css('[data-testid="toggle"]')).nativeElement;
    sidenavEl = fixture.debugElement.query(By.css('.sidenav')).nativeElement;
    collapseElements = fixture.debugElement
      .queryAll(By.directive(MdbCollapseDirective))
      .map((debugElement) => debugElement.nativeElement);
  });

  describe('Inputs', () => {
    it('should close other category list if accordion input is set to true', fakeAsync(() => {
      testComponent.accordion = true;
      fixture.detectChanges();

      expect(firstCollapseEl.classList.contains('show')).toBe(false);
      expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);

      firstCollapseEl.click();
      fixture.detectChanges();
      flush();

      expect(collapseElements[0].classList.contains('show')).toBe(true);
      expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);

      secondCollapseEl.click();
      fixture.detectChanges();
      flush();

      expect(collapseElements[0].classList.contains('show')).toBe(false);
      expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(true);

      secondCollapseEl.click();
      fixture.detectChanges();
      flush();

      expect(collapseElements[0].classList.contains('show')).toBe(false);
      expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);
    }));

    it('should not show backdrop if backdrop input is set to false', fakeAsync(() => {
      testComponent.backdrop = false;
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.sidenav-backdrop'))).toBe(null);

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();

      expect(fixture.debugElement.query(By.css('.sidenav-backdrop'))).toBe(null);

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();

      expect(fixture.debugElement.query(By.css('.sidenav-backdrop'))).toBe(null);
    }));

    it('should add custom backdrop class if backdropClass input is set', fakeAsync(() => {
      testComponent.backdropClass = 'custom-class';
      fixture.detectChanges();

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();

      const sidenavBackdropEl: HTMLDivElement = fixture.debugElement.query(
        By.css('.sidenav-backdrop')
      ).nativeElement;
      expect(sidenavBackdropEl).not.toBe(null);
      expect(sidenavBackdropEl.classList.contains('custom-class')).toBe(true);
    }));

    it('should not close a sidenav on Escape keydown if closeOnEsc input is set to false', fakeAsync(() => {
      testComponent.closeOnEsc = false;
      fixture.detectChanges();

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();

      expect(sidenavEl.style.transform).toBe('translateX(0%)');

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      fixture.detectChanges();
      flush();

      expect(sidenavEl.style.transform).toBe('translateX(0%)');
    }));

    it('should set proper class when color input is set', () => {
      expect(sidenavEl.classList.contains('sidenav-primary')).toBe(true);

      testComponent.color = 'secondary';
      fixture.detectChanges();

      expect(sidenavEl.classList.contains('sidenav-secondary')).toBe(true);
    });

    it('should disable scroll when sidenav is opened with disableWindowScroll', fakeAsync(() => {
      testComponent.disableWindowScroll = true;
      fixture.detectChanges();

      const testDiv = document.createElement('div');
      testDiv.textContent = 'Test Div';
      testDiv.style.height = '2000px';
      document.body.appendChild(testDiv);

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();

      expect(sidenavEl.style.transform).toBe('translateX(0%)');
      expect(document.body.style.overflow).toBe('hidden');

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();

      expect(sidenavEl.style.transform).toBe('translateX(-100%)');
      expect(document.body.style.overflow).toBe('');
    }));

    it('should expand slim sidenav on hover when expandOnHover input is set to true', fakeAsync(() => {
      testComponent.expandOnHover = true;
      testComponent.slim = true;
      testComponent.slimCollapsed = true;
      sidenavComponent.show();

      fixture.detectChanges();
      flush();

      const sidenavWidth = sidenavComponent.width + 'px';
      const sidenavSlimWidth = sidenavComponent.slimWidth + 'px';

      expect(sidenavEl.style.width).toBe(sidenavSlimWidth);

      sidenavEl.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      flush();

      expect(sidenavEl.style.width).toBe(sidenavWidth);

      sidenavEl.dispatchEvent(new Event('mouseleave'));
      fixture.detectChanges();
      flush();

      expect(sidenavEl.style.width).toBe(sidenavSlimWidth);
    }));

    it('should not configure focus trap upon opening a sidenav if focusTrap input is set to false', fakeAsync(() => {
      let focusTrapAnchors: HTMLDivElement[] =
        fixture.nativeElement.querySelectorAll('.cdk-focus-trap-anchor');

      expect(focusTrapAnchors.length).toBe(0);

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();
      focusTrapAnchors = fixture.nativeElement.querySelectorAll('.cdk-focus-trap-anchor');

      expect(sidenavEl.style.transform).toBe('translateX(0%)');
      expect(focusTrapAnchors.length).toBeGreaterThan(0);

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();
      focusTrapAnchors = fixture.nativeElement.querySelectorAll('.cdk-focus-trap-anchor');

      expect(sidenavEl.style.transform).toBe('translateX(-100%)');
      expect(focusTrapAnchors.length).toBe(0);

      testComponent.focusTrap = false;
      fixture.detectChanges();
      focusTrapAnchors = fixture.nativeElement.querySelectorAll('.cdk-focus-trap-anchor');

      expect(focusTrapAnchors.length).toBe(0);

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();
      focusTrapAnchors = fixture.nativeElement.querySelectorAll('.cdk-focus-trap-anchor');

      expect(sidenavEl.style.transform).toBe('translateX(0%)');
      expect(focusTrapAnchors.length).toBe(0);

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
      sidenavToggleEl.click();
      fixture.detectChanges();
      flush();
      focusTrapAnchors = fixture.nativeElement.querySelectorAll('.cdk-focus-trap-anchor');

      expect(sidenavEl.style.transform).toBe('translateX(-100%)');
      expect(focusTrapAnchors.length).toBe(0);
    }));

    it('should add show class if hidden input is set to false', () => {
      expect(sidenavEl.classList).not.toContain('show');

      testComponent.hidden = false;
      fixture.detectChanges();

      expect(sidenavEl.classList).toContain('show');
    });

    it('should change mode if mode input is set', () => {
      expect(sidenavComponent.mode).toBe('over');

      testComponent.mode = 'push';
      fixture.detectChanges();

      expect(sidenavComponent.mode).toBe('push');
    });

    it('should introduce slim sidenav behaviour if slim input is set to true', fakeAsync(() => {
      testComponent.slim = true;
      firstCollapseEl.click();
      fixture.detectChanges();
      flush();

      const sidenavWidth = sidenavComponent.width + 'px';
      const sidenavSlimWidth = sidenavComponent.slimWidth + 'px';
      const firstCollapseSpan: HTMLSpanElement = firstCollapseEl.querySelector('[slim="false"]');

      expect(firstCollapseSpan.style.display).toBe('unset');
      expect(sidenavComponent.slimCollapsed).toBe(false);
      expect(sidenavEl.classList).not.toContain('sidenav-slim');
      expect(sidenavEl.style.width).toBe(sidenavWidth);

      firstCollapseEl.click();
      fixture.detectChanges();
      flush();

      expect(firstCollapseSpan.style.display).toBe('none');
      expect(sidenavComponent.slimCollapsed).toBe(true);
      expect(sidenavEl.classList).toContain('sidenav-slim');
      expect(sidenavEl.style.width).toBe(sidenavSlimWidth);
    }));

    it('should initialize slim sidenav in collapsed state if slimCollapsed input is set to true', fakeAsync(() => {
      testComponent.slim = true;
      testComponent.slimCollapsed = true;
      fixture.detectChanges();
      flush();

      const sidenavSlimWidth = sidenavComponent.slimWidth + 'px';

      expect(sidenavEl.style.width).toBe(sidenavSlimWidth);
    }));

    it('should set width of slim sidenav if slimWidth input is set', fakeAsync(() => {
      testComponent.slim = true;
      testComponent.slimCollapsed = true;
      testComponent.slimWidth = 80;
      fixture.detectChanges();
      flush();

      expect(sidenavEl.style.width).toBe('80px');
    }));

    it('should set position style of sidenav if position input is set', () => {
      expect(sidenavEl.style.position).toBe('fixed');

      testComponent.position = 'absolute';
      fixture.detectChanges();

      expect(sidenavEl.style.position).toBe('absolute');

      testComponent.position = 'relative';
      fixture.detectChanges();

      expect(sidenavEl.style.position).toBe('relative');
    });

    it('should add sidenav-right class if right input is set to true', () => {
      expect(sidenavComponent.right).toBe(false);
      expect(sidenavEl.classList.contains('sidenav-right')).toBe(false);

      testComponent.right = true;
      fixture.detectChanges();

      expect(sidenavComponent.right).toBe(true);
      expect(sidenavEl.classList.contains('sidenav-right')).toBe(true);
    });

    it('should set transition-duration style of sidenav if transitionDuration input is set', () => {
      expect(sidenavEl.style.transitionDuration).toBe('0.3s');

      testComponent.transitionDuration = 400;
      fixture.detectChanges();

      expect(sidenavEl.style.transitionDuration).toBe('0.4s');
    });

    it('should set width of sidenav if width input is set', () => {
      expect(sidenavEl.style.width).toBe('240px');

      testComponent.width = 255;
      fixture.detectChanges();

      expect(sidenavEl.style.width).toBe('255px');
    });
  });
  describe('Outputs', () => {
    it('should emit events on show and hide', fakeAsync(() => {
      const ANIMATION_TIME = testComponent.transitionDuration + 5;
      const showSpy = jest.spyOn(sidenavComponent.sidenavShow, 'emit');
      const shownSpy = jest.spyOn(sidenavComponent.sidenavShown, 'emit');
      const hideSpy = jest.spyOn(sidenavComponent.sidenavHide, 'emit');
      const hiddenSpy = jest.spyOn(sidenavComponent.sidenavHidden, 'emit');

      sidenavComponent.show();

      expect(showSpy).toHaveBeenCalledTimes(1);

      tick(ANIMATION_TIME);

      expect(shownSpy).toHaveBeenCalledTimes(1);

      sidenavComponent.hide();

      expect(hideSpy).toHaveBeenCalledTimes(1);

      tick(ANIMATION_TIME);

      expect(hiddenSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit events on expand and collapse', fakeAsync(() => {
      const ANIMATION_TIME = testComponent.transitionDuration + 5;
      const expandSpy = jest.spyOn(sidenavComponent.sidenavExpand, 'emit');
      const expandedSpy = jest.spyOn(sidenavComponent.sidenavExpanded, 'emit');
      const collapseSpy = jest.spyOn(sidenavComponent.sidenavCollapse, 'emit');
      const collapsedSpy = jest.spyOn(sidenavComponent.sidenavCollapsed, 'emit');

      sidenavComponent.toggleSlim();

      expect(collapseSpy).toHaveBeenCalledTimes(1);

      tick(ANIMATION_TIME);

      expect(collapsedSpy).toHaveBeenCalledTimes(1);

      sidenavComponent.toggleSlim();

      expect(expandSpy).toHaveBeenCalledTimes(1);

      tick(ANIMATION_TIME);

      expect(expandedSpy).toHaveBeenCalledTimes(1);
    }));
  });
  describe('Public Methods', () => {
    it('should change mode programmatically if public setMode method is used', () => {
      expect(sidenavComponent.mode).toBe('over');

      sidenavComponent.setMode('push');

      expect(sidenavComponent.mode).toBe('push');
    });

    it('should hide sidenav programmatically if public hide method is used', () => {
      sidenavComponent.show();

      expect(sidenavEl.style.transform).toBe('translateX(0%)');

      sidenavComponent.hide();

      expect(sidenavEl.style.transform).toBe('translateX(-100%)');
    });

    it('should show sidenav programmatically if public show method is used', () => {
      expect(sidenavEl.style.transform).toBe('');

      sidenavComponent.show();

      expect(sidenavEl.style.transform).toBe('translateX(0%)');
    });

    it('should toggle sidenav programmatically if public toggle method is used', () => {
      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
      expect(sidenavEl.style.transform).toBe('');

      sidenavComponent.toggle();

      expect(sidenavEl.style.transform).toBe('translateX(0%)');

      jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
      sidenavComponent.toggle();

      expect(sidenavEl.style.transform).toBe('translateX(-100%)');
    });

    it('should toggle slim programmatically if public toggleSlim method is used', fakeAsync(() => {
      const sidenavWidth = sidenavComponent.width + 'px';

      expect(sidenavEl.style.width).toBe(sidenavWidth);

      sidenavComponent.toggleSlim();
      fixture.detectChanges();
      flush();

      const sidenavSlimWidth = sidenavComponent.slimWidth + 'px';

      expect(sidenavEl.style.width).toBe(sidenavSlimWidth);
    }));
  });

  it('should change default options', () => {
    testComponent.color = 'secondary';
    testComponent.accordion = true;
    testComponent.backdrop = false;
    testComponent.backdropClass = 'test';
    testComponent.closeOnEsc = false;
    testComponent.expandOnHover = true;
    testComponent.hidden = false;
    testComponent.mode = 'push';
    testComponent.scrollContainer = '#testScroll2';
    testComponent.slim = true;
    testComponent.slimCollapsed = true;
    testComponent.slimWidth = 100;
    testComponent.position = 'fixed';
    testComponent.right = true;
    testComponent.transitionDuration = 500;
    testComponent.width = 500;
    testComponent.focusTrap = false;
    testComponent.disableWindowScroll = true;

    fixture.detectChanges();

    expect(sidenavComponent.color).toBe('secondary');
    expect(sidenavComponent.accordion).toBe(true);
    expect(sidenavComponent.backdrop).toBe(false);
    expect(sidenavComponent.backdropClass).toBe('test');
    expect(sidenavComponent.closeOnEsc).toBe(false);
    expect(sidenavComponent.expandOnHover).toBe(true);
    expect(sidenavComponent.hidden).toBe(false);
    expect(sidenavComponent.mode).toBe('push');
    expect(sidenavComponent.scrollContainer).toBe('#testScroll2');
    expect(sidenavComponent.slim).toBe(true);
    expect(sidenavComponent.slimCollapsed).toBe(true);
    expect(sidenavComponent.slimWidth).toBe(100);
    expect(sidenavComponent.position).toBe('fixed');
    expect(sidenavComponent.right).toBe(true);
    expect(sidenavComponent.transitionDuration).toBe(500);
    expect(sidenavComponent.width).toBe(500);
    expect(sidenavComponent.focusTrap).toBe(false);
    expect(sidenavComponent.disableWindowScroll).toBe(true);
  });

  it('should open and close on toggle click', fakeAsync(() => {
    jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
    sidenavToggleEl.click();
    fixture.detectChanges();
    flush();

    expect(sidenavEl.style.transform).toBe('translateX(0%)');

    jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
    sidenavToggleEl.click();
    fixture.detectChanges();
    flush();

    expect(sidenavEl.style.transform).toBe('translateX(-100%)');
  }));

  it('should close on backdrop click', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
    sidenavToggleEl.click();
    fixture.detectChanges();
    flush();

    expect(sidenavEl.style.transform).toBe('translateX(0%)');

    const sidenavBackdropEl: HTMLDivElement = fixture.debugElement.query(
      By.css('.sidenav-backdrop')
    ).nativeElement;
    jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
    sidenavBackdropEl.click();
    fixture.detectChanges();
    flush();

    expect(sidenavEl.style.transform).toBe('translateX(-100%)');
  }));

  it('should set active element and remove active class for previous element', () => {
    const link2Element = fixture.debugElement.query(By.css('[data-testid="link2"]')).nativeElement;
    const link3Element = fixture.debugElement.query(By.css('[data-testid="link3"]')).nativeElement;

    expect(link2Element.classList.contains('active')).toBe(false);
    expect(link3Element.classList.contains('active')).toBe(false);

    link2Element.click();

    expect(link2Element.classList.contains('active')).toBe(true);
    expect(link3Element.classList.contains('active')).toBe(false);

    link3Element.click();

    expect(link2Element.classList.contains('active')).toBe(false);
    expect(link3Element.classList.contains('active')).toBe(true);
  });

  it('should toggle collapse item group on Enter keydown', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    const enterEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      keyCode: 13,
      key: 'Enter',
    });

    const sEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      keyCode: 83,
      key: 's',
    });

    expect(collapseElements[0].classList.contains('show')).toBe(false);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);

    firstCollapseEl.dispatchEvent(sEvent);

    fixture.detectChanges();
    flush();

    expect(collapseElements[0].classList.contains('show')).toBe(false);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);

    firstCollapseEl.dispatchEvent(enterEvent);

    fixture.detectChanges();
    flush();

    expect(collapseElements[0].classList.contains('show')).toBe(true);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);

    secondCollapseEl.dispatchEvent(enterEvent);
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].classList.contains('show')).toBe(true);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(true);

    secondCollapseEl.dispatchEvent(enterEvent);
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].classList.contains('show')).toBe(true);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);

    firstCollapseEl.dispatchEvent(enterEvent);
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].classList.contains('show')).toBe(false);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);
  }));

  it('should toggle collapse item group', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].classList.contains('show')).toBe(false);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);

    firstCollapseEl.click();
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].classList.contains('show')).toBe(true);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);

    secondCollapseEl.click();
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].classList.contains('show')).toBe(true);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(true);

    secondCollapseEl.click();
    fixture.detectChanges();
    flush();
    expect(collapseElements[0].classList.contains('show')).toBe(true);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);

    firstCollapseEl.click();
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].classList.contains('show')).toBe(false);
    expect(collapseElements[collapseElements.length - 1].classList.contains('show')).toBe(false);
  }));

  it('should show backdrop on open and hide backdrop on close', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    expect(fixture.debugElement.query(By.css('.sidenav-backdrop'))).toBe(null);

    jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
    sidenavToggleEl.click();
    fixture.detectChanges();
    flush();
    let sidenavBackdropEl: HTMLDivElement = fixture.debugElement.query(
      By.css('.sidenav-backdrop')
    ).nativeElement;
    expect(sidenavBackdropEl).not.toBe(null);
    expect(sidenavBackdropEl.style.opacity).toBe('1');

    jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
    sidenavToggleEl.click();
    fixture.detectChanges();
    flush();
    sidenavBackdropEl = fixture.debugElement.query(By.css('.sidenav-backdrop')).nativeElement;
    expect(sidenavBackdropEl).not.toBe(null);
    expect(sidenavBackdropEl.style.opacity).toBe('0');
  }));

  it('should close on Escape keydown', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(false);
    sidenavToggleEl.click();
    fixture.detectChanges();
    flush();

    expect(sidenavEl.style.transform).toBe('translateX(0%)');

    jest.spyOn(sidenavComponent, 'isVisible', 'get').mockReturnValue(true);
    const event = new KeyboardEvent('keydown', { code: 'Escape' });
    document.dispatchEvent(event);
    fixture.detectChanges();
    flush();

    expect(sidenavEl.style.transform).toBe('translateX(-100%)');
  }));

  describe('MdbSidenavItemComponent', () => {
    it('should create an arrow icon element for items with collapse', () => {
      const sidenavItems: MdbSidenavItemComponent[] = fixture.debugElement
        .queryAll(By.css('mdb-sidenav-item'))
        .map((debugElement) => debugElement.componentInstance);
      const collapseItems = sidenavItems.filter((item) => item.collapse !== undefined);
      const everyItemHasArrow = collapseItems.every(
        (item) => item._sidenavLink.nativeElement.querySelector('.rotate-icon') !== null
      );
      expect(everyItemHasArrow).toBe(true);
    });

    it('should rotate an arrow on item collapse and expand', fakeAsync(() => {
      const iconArrowEl: HTMLElement = firstCollapseEl.querySelector('.rotate-icon');

      expect(iconArrowEl.style.transform).toBe('');

      firstCollapseEl.click();
      flush();

      expect(iconArrowEl.style.transform).toBe('rotate(180deg)');

      firstCollapseEl.click();
      flush();

      expect(iconArrowEl.style.transform).toBe('rotate(0deg)');
    }));
  });
});

describe('MDB Groups Sidenav', () => {
  let fixture: ComponentFixture<GroupsSidenavComponent>;
  let testComponent: GroupsSidenavComponent;

  function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [MdbSidenavModule, MdbCollapseModule],
      declarations: [component],
      providers: [...providers],
      teardown: { destroyAfterEach: false },
    });

    TestBed.compileComponents();

    return TestBed.createComponent<T>(component);
  }

  beforeEach(() => {
    fixture = createComponent(GroupsSidenavComponent);
    fixture.detectChanges();
    testComponent = fixture.componentInstance;
  });

  it('should close other category list only in clicked sidenav menu if accordion = true and mdbSidenavMenu directive is used', fakeAsync(() => {
    const collapseElements: DebugElement[] = fixture.debugElement.queryAll(
      By.directive(MdbCollapseDirective)
    );
    const firstCollapseEl: HTMLAnchorElement = fixture.debugElement.query(
      By.css('[data-testid="collapse1"]')
    ).nativeElement;
    const secondCollapseEl: HTMLAnchorElement = fixture.debugElement.query(
      By.css('[data-testid="collapse2"]')
    ).nativeElement;
    const thirdCollapseEl: HTMLAnchorElement = fixture.debugElement.query(
      By.css('[data-testid="collapse3"]')
    ).nativeElement;
    const fourthCollapseEl: HTMLAnchorElement = fixture.debugElement.query(
      By.css('[data-testid="collapse4"]')
    ).nativeElement;

    testComponent.accordion = true;
    fixture.detectChanges();

    expect(collapseElements[0].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[1].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[2].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[3].nativeElement.classList.contains('show')).toBe(false);

    firstCollapseEl.click();
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].nativeElement.classList.contains('show')).toBe(true);
    expect(collapseElements[1].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[2].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[3].nativeElement.classList.contains('show')).toBe(false);

    secondCollapseEl.click();
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[1].nativeElement.classList.contains('show')).toBe(true);
    expect(collapseElements[2].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[3].nativeElement.classList.contains('show')).toBe(false);

    thirdCollapseEl.click();
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[1].nativeElement.classList.contains('show')).toBe(true);
    expect(collapseElements[2].nativeElement.classList.contains('show')).toBe(true);
    expect(collapseElements[3].nativeElement.classList.contains('show')).toBe(false);

    fourthCollapseEl.click();
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[1].nativeElement.classList.contains('show')).toBe(true);
    expect(collapseElements[2].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[3].nativeElement.classList.contains('show')).toBe(true);

    fourthCollapseEl.click();
    secondCollapseEl.click();
    fixture.detectChanges();
    flush();

    expect(collapseElements[0].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[1].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[2].nativeElement.classList.contains('show')).toBe(false);
    expect(collapseElements[3].nativeElement.classList.contains('show')).toBe(false);
  }));
});

@Component({
  selector: 'mdb-test-sidenav',
  template: `
    <mdb-sidenav-layout>
      <mdb-sidenav
        #sidenav="mdbSidenav"
        [color]="color"
        [accordion]="accordion"
        [backdrop]="backdrop"
        [backdropClass]="backdropClass"
        [closeOnEsc]="closeOnEsc"
        [expandOnHover]="expandOnHover"
        [hidden]="hidden"
        [mode]="mode"
        [scrollContainer]="scrollContainer"
        [slim]="slim"
        [slimCollapsed]="slimCollapsed"
        [slimWidth]="slimWidth"
        [position]="position"
        [right]="right"
        [transitionDuration]="transitionDuration"
        [width]="width"
        [focusTrap]="focusTrap"
        [disableWindowScroll]="disableWindowScroll"
      >
        <ul id="testScroll2"></ul>
        <ul class="sidenav-menu" id="testScroll">
          <mdb-sidenav-item>
            <a class="sidenav-link" tabindex="0"
              ><i class="far fa-smile fa-fw me-3"></i><span>Link 1</span></a
            >
          </mdb-sidenav-item>
          <mdb-sidenav-item>
            <a class="sidenav-link" data-testid="collapse1" tabindex="0"
              ><i class="fas fa-grin fa-fw me-3"></i><span slim="false">Category 1</span></a
            >
            <ul class="sidenav-collapse" mdbCollapse>
              <li class="sidenav-item">
                <a class="sidenav-link" data-testid="link2" tabindex="0">Link 2</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link" data-testid="link3" tabindex="0">Link 3</a>
              </li>
            </ul>
          </mdb-sidenav-item>
          <mdb-sidenav-item>
            <a class="sidenav-link" data-testid="collapse2" tabindex="0"
              ><i class="fas fa-grin-wink fa-fw me-3"></i><span>Category 2</span></a
            >
            <ul class="sidenav-collapse" mdbCollapse>
              <li class="sidenav-item">
                <a class="sidenav-link" tabindex="0">Link 4</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link" tabindex="0">Link 5</a>
              </li>
            </ul>
          </mdb-sidenav-item>
        </ul>
      </mdb-sidenav>
      <mdb-sidenav-content>
        <!-- Toggler -->
        <button data-testid="toggle" class="btn btn-primary" (click)="sidenav.toggle()">
          <i class="fas fa-bars"></i>
        </button>
        <!-- Toggler -->
      </mdb-sidenav-content>
    </mdb-sidenav-layout>
  `,
  standalone: false,
})
class TestSidenavComponent {
  accordion = false;
  backdrop = true;
  backdropClass: string;
  closeOnEsc = true;
  color = 'primary';
  disableWindowScroll = false;
  expandOnHover = false;
  focusTrap = true;
  hidden = true;
  mode = 'over';
  scrollContainer = '#testScroll';
  slim = false;
  slimCollapsed = false;
  slimWidth = 77;
  position = 'fixed';
  right = false;
  transitionDuration = 300;
  width = 240;
}

@Component({
  selector: 'mdb-groups-sidenav',
  template: `
    <mdb-sidenav-layout>
      <mdb-sidenav [accordion]="accordion">
        <ul class="sidenav-menu" mdbSidenavMenu>
          <mdb-sidenav-item>
            <a class="sidenav-link"><i class="far fa-smile fa-fw me-3"></i><span>Link 1</span></a>
          </mdb-sidenav-item>
          <mdb-sidenav-item>
            <a class="sidenav-link" data-testid="collapse1"
              ><i class="fas fa-grin fa-fw me-3"></i><span>Category 1</span></a
            >
            <ul class="sidenav-collapse" mdbCollapse>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 2</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 3</a>
              </li>
            </ul>
          </mdb-sidenav-item>
          <mdb-sidenav-item>
            <a class="sidenav-link" data-testid="collapse2"
              ><i class="fas fa-grin-wink fa-fw me-3"></i><span>Category 2</span></a
            >
            <ul class="sidenav-collapse" mdbCollapse>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 4</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 5</a>
              </li>
            </ul>
          </mdb-sidenav-item>
        </ul>
        <hr />
        <ul class="sidenav-menu" mdbSidenavMenu>
          <mdb-sidenav-item>
            <a class="sidenav-link"><i class="far fa-smile fa-fw me-3"></i><span>Link 6</span></a>
          </mdb-sidenav-item>
          <mdb-sidenav-item>
            <a class="sidenav-link" data-testid="collapse3"
              ><i class="fas fa-grin fa-fw me-3"></i><span>Category 3</span></a
            >
            <ul class="sidenav-collapse" mdbCollapse>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 7</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 8</a>
              </li>
            </ul>
          </mdb-sidenav-item>
          <mdb-sidenav-item>
            <a class="sidenav-link" data-testid="collapse4"
              ><i class="fas fa-grin-wink fa-fw me-3"></i><span>Category 4</span></a
            >
            <ul class="sidenav-collapse" mdbCollapse>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 9</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 10</a>
              </li>
            </ul>
          </mdb-sidenav-item>
        </ul>
      </mdb-sidenav>
      <mdb-sidenav-content>
        <!-- Toggler -->
        <button class="btn btn-primary" (click)="sidenav.toggle()">
          <i class="fas fa-bars"></i>
        </button>
        <!-- Toggler -->
      </mdb-sidenav-content>
    </mdb-sidenav-layout>
  `,
  standalone: false,
})
class GroupsSidenavComponent {
  accordion = false;
}
