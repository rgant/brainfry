export enum FORMS {
  /**
   * Input event delay for form fields to prevent an event on every keystroke. Milliseconds
   */
  inputDebounce = 1000,
}

/**
 * This should match [Password Policy](/docs/firebase-manual-config.md#update-the-configuration)
 */
export enum PASSWORDS {
  /**
   * Glyphs, Firebase default maximum
   */
  maxLength = 4096,

  /**
   * Glyphs, nominally secure length
   */
  minLength = 12,

  /**
   * Password strength as computed by check-password-strength library.
   * https://github.com/deanilvincent/check-password-strength?tab=readme-ov-file#result
   */
  minStrength = 2,
}
