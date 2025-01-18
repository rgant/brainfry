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
}
