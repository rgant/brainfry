# Accessibility

Notes on accessibility for how to design this application.

## Forms

1. `required` attribute is sufficient to indicate required fields to screen readers.
2. `aria-describedby` attribute should point to a _static_ (this is an SPA) element
   by ID attribute. Error messages should be added within this element.
3. `aria-invalid` attribute should default to `false` until the control is blurred.
   Which in Angular can be indicated by `Control#touched`. Then if also `dirty`
   (Control value changed) and `invalid` this should be set to `true`.
4. A delay of about 1 second after input stops before displaying errors is an
   acceptable compromise between not interrupting users and prompt feedback.
   Sighted users will get feedback before blur after the delay. Screen readers
   will wait at least the delay and on blur; whichever comes last.

### Documentation

1. [Support for aria-errormessage is getting better, but still not there yet
](https://cerovac.com/a11y/2024/06/support-for-aria-errormessage-is-getting-better-but-still-not-there-yet/) June 2024
2. [What is the difference between aria-errormessage and aria-alert?](https://stackoverflow.com/a/78675883/41908) June 2024
3. [Exposing Field Errors](https://adrianroselli.com/2023/04/exposing-field-errors.html) August 2023
4. [Testing error messages with JAWS and NVDA](https://www.davidmacd.com/blog/test-aria-describedby-errormessage-aria-live.html) May 2020
