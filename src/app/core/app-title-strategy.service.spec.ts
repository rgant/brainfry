/**
 * Design of these tests are based on this blog posts:
 * https://blog.angular.dev/write-better-tests-without-router-mocks-stubs-bf5fc95c1c57
 * https://jamienordmeyer.medium.com/unit-testing-a-custom-angular-title-strategy-64d05f3d401f
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, TitleStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { AppTitleStrategyService } from './app-title-strategy.service';

@Component({ template: '' })
class TestComponent {}

describe('AppTitleStrategyService', (): void => {
  let harness: RouterTestingHarness;
  let titleSpy: jasmine.SpyObj<Title>;

  beforeEach(async (): Promise<void> => {
    titleSpy = jasmine.createSpyObj<Title>([ 'getTitle', 'setTitle' ]);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'with-title', component: TestComponent, title: 'Has a Title' },
          { path: 'without-title', component: TestComponent },
        ]),
        { provide: TitleStrategy, useClass: AppTitleStrategyService },
        { provide: Title, useValue: titleSpy },
      ],
    });

    harness = await RouterTestingHarness.create();
  });

  it('should construct title from base title', async (): Promise<void> => {
    titleSpy.getTitle.and.returnValue('bar');
    await harness.navigateByUrl('/with-title');

    expect(titleSpy.setTitle).toHaveBeenCalledOnceWith('Has a Title | bar');
  });

  it('should default base title', async (): Promise<void> => {
    titleSpy.getTitle.and.returnValue('bar');
    await harness.navigateByUrl('/without-title');

    expect(titleSpy.setTitle).toHaveBeenCalledOnceWith('bar');
  });
});
