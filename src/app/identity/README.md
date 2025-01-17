# Identity Module

This module will reuse the `email: FormControl` in three separate areas:

1. Login
2. Forgot Password
3. Change Email (maybe a bit different in the nuance?)

And while it might appear that the `password: FormControl` is reused, there are
subtle differences:

1. Login
2. Reset Password (need two _new_ password fields that have different autocomple
   and autofocus)
3. Change Email

If we add self signup then you could add Join to both of those lists, but
perhaps with other subtle differences.

## Form Control Template Reuse

After hours of researching Angular ControlValueAccessors it just doesn't seem
like the amount of code I would need to add to make these template into
reuseable Components is worth while. The primary annoyance is that it seems to
be impossible to have the FormControl from the parent FormGroup in the
`constructor`. You have to wait until the Angular lifecycle begins. That and a
Noop CVA just seems like a waste. I could just `input` the Control directly, but
that can also cause issues sometimes. So for now I will walk away from that
project until I can find a better way.
