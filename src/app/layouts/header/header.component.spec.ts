import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { getCompiled, safeQuerySelector } from '~/testing/utilities';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', (): void => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ HeaderComponent ],
      providers: [ provideRouter([]) ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should hide menu on nav link click', (): void => {
    // Not super happy with this test, it feels fragile and not isolated.
    const clickSpy = spyOn(component, 'onClick').and.callThrough();
    const compiled: HTMLElement = getCompiled(fixture);
    const elements: NodeListOf<Element> = compiled.querySelectorAll('*');

    // Prevent clicking on the button from interfering with the test
    spyOn(component, 'toggleMenu');

    // Show the menu for testing
    component.$showMenu.set(true);

    // Test with known elements
    let clickCnt = 0;
    // not destroying in TestBed teardown will cause these links to actually try and fail to navigate breaking tests.
    const lnkEl: HTMLAnchorElement = safeQuerySelector(compiled, 'a');
    lnkEl.click();
    clickCnt += 1;

    expect(clickSpy).toHaveBeenCalledTimes(clickCnt);
    expect(component.$showMenu()).withContext('$showMenu').toBeFalse();

    // Re-show the menu for further testing
    component.$showMenu.set(true);

    const listEl: HTMLUListElement = safeQuerySelector(compiled, '.menu');
    listEl.click();
    clickCnt += 1;

    expect(clickSpy).toHaveBeenCalledTimes(clickCnt);
    expect(component.$showMenu()).withContext('$showMenu').toBeTrue();

    // Test most of the elements in the component.
    expect(elements.length).toBeGreaterThan(0);
    for (const el of elements) {
      if (el instanceof HTMLElement) { // Skip SVG Title and Path
        el.click();
        clickCnt += 1;

        expect(clickSpy).toHaveBeenCalledTimes(clickCnt);

        if (el instanceof HTMLAnchorElement) {
          expect(component.$showMenu()).withContext('$showMenu').toBeFalse();

          // Re-show the menu for further testing
          component.$showMenu.set(true);
        } else {
          expect(component.$showMenu()).withContext('$showMenu').toBeTrue();
        }
      }
    }
  });

  it('should toggle show menu signal', (): void => {
    expect(component.$showMenu()).withContext('$showMenu').toBeFalse();

    component.toggleMenu();

    expect(component.$showMenu()).withContext('$showMenu').toBeTrue();

    component.toggleMenu();

    expect(component.$showMenu()).withContext('$showMenu').toBeFalse();
  });

  it('should call toggleMenu on button click', (): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const buttonEl: HTMLButtonElement = safeQuerySelector(compiled, '.toggle');
    const toggleSpy = spyOn(component, 'toggleMenu');

    buttonEl.click();

    expect(toggleSpy).toHaveBeenCalledTimes(1);
  });

  it('should set button aria-expanded', (): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const buttonEl: HTMLButtonElement = safeQuerySelector(compiled, '.toggle');

    expect(component.$showMenu()).withContext('$showMenu').toBeFalse();
    expect(buttonEl.getAttribute('aria-expanded')).withContext('aria-expanded').toBe('false');

    component.$showMenu.set(true);
    fixture.detectChanges();

    expect(buttonEl.getAttribute('aria-expanded')).withContext('aria-expanded').toBe('true');
  });

  it('should toggle menu icon', (): void => {
    const compiled: HTMLElement = getCompiled(fixture);

    expect(safeQuerySelector(compiled, '.icon svg')).toHaveClass('fa-bars');

    component.$showMenu.set(true);
    fixture.detectChanges();

    expect(safeQuerySelector(compiled, '.icon svg')).toHaveClass('fa-x');
  });

  it('should toggle menu expanded class', (): void => {
    const compiled: HTMLElement = getCompiled(fixture);
    const menuEl: HTMLUListElement = safeQuerySelector(compiled, '.menu');

    expect(menuEl).not.toHaveClass('expanded');

    component.$showMenu.set(true);
    fixture.detectChanges();

    expect(menuEl).toHaveClass('expanded');
  });
});
