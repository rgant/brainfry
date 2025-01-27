import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { PageNotFoundComponent, ROBOTS_META } from './page-not-found.component';

describe('PageNotFoundComponent', (): void => {
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;
  let metaSpy: jasmine.SpyObj<Meta>;

  const metaTag = document.createElement('meta');

  beforeEach(async (): Promise<void> => {
    metaSpy = jasmine.createSpyObj<Meta>('Meta', [ 'addTag', 'removeTagElement' ]);
    metaSpy.addTag.and.returnValue(metaTag);

    await TestBed.configureTestingModule({
      imports: [ PageNotFoundComponent ],
      providers: [
        { provide: Meta, useValue: metaSpy },
        provideRouter([]),
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add robots meta tag', (): void => {
    expect(component).toBeTruthy();
    expect(metaSpy.addTag).toHaveBeenCalledOnceWith(ROBOTS_META);
    expect(metaSpy.removeTagElement).not.toHaveBeenCalled();
  });

  it('should remove robots meta tag', (): void => {
    fixture.destroy();

    expect(metaSpy.removeTagElement).toHaveBeenCalledOnceWith(metaTag);
  });
});
