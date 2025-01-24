import type { ComponentFixture } from '@angular/core/testing';

/**
 * Handle type safety to get fixture native element.
 *
 * @throws TypeError
 * Thrown if `fixture.nativeElement` is not an instance of HTMLElement.
 */
export const getCompiled = <T>(fixture: ComponentFixture<T>): HTMLElement => {
  const compiled: unknown = fixture.nativeElement;

  if (!(compiled instanceof HTMLElement)) {
    throw new TypeError('Expected fixture.nativeElement to be instance of HTMLElement');
  }

  return compiled;
};

/**
 * Safely query the DOM handling nulls.
 *
 * @throws TypeError
 * Thrown if querySelector returns `null`.
 */
/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- This is effectively an any return type, but it is the same
 * way that querySelector type is defined: `querySelector<E extends Element = Element>(selectors: string): E | null;` in lib.dom.d.ts.
 * @see https://effectivetypescript.com/2020/08/12/generics-golden-rule/
 */
export const safeQuerySelector = <T extends Element>(parentElement: HTMLElement, query: string): T => {
  const element: T | null = parentElement.querySelector<T>(query);

  if (element === null) {
    throw new TypeError('Query returned null');
  }

  return element;
};

