import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';

describe('AppComponent', (): void => {
  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ AppComponent ],
    }).compileComponents();
  });

  it('should create the app', (): void => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it("should have the 'brainfry' title", (): void => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('brainfry');
  });

  it('should render title', (): void => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as unknown;
    if (!(compiled instanceof HTMLElement)) {
      throw new TypeError('nativeElement is not HTMLElement');
    }
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, brainfry');
  });
});
