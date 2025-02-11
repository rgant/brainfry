import { FirebaseError } from '@angular/fire/app';

import { getErrorCode } from './error-code';

describe('getErrorCode', (): void => {
  it('should get code from FirebaseError', (): void => {
    const error = new FirebaseError('testing/expected', 'Mock FirebaseError for testing');
    const code = getErrorCode(error);

    expect(code).toBe('testing/expected');
  });

  it('should fallback to Error message', (): void => {
    const error = new Error('Just a standard JavaScript Error Object');
    const code = getErrorCode(error);

    expect(code).toBe('Just a standard JavaScript Error Object');
  });

  it('should do something with other types', (): void => {
    const consoleSpy = spyOn(console, 'error');
    const code = getErrorCode({ code: 'testing/not-expected', message: 'Not an Error object' });

    expect(code).toBe('unknown');
    expect(consoleSpy).toHaveBeenCalledOnceWith('Unknown Error', { code: 'testing/not-expected', message: 'Not an Error object' });
  });
});
