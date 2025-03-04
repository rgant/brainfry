# Angular Setup

Install local dependencies:

```sh
brew install nvm tidy-html5
npm install --global @awmottaz/prettier-plugin-void-html prettier-plugin-organize-attributes
```

Setup `nvm` for automatic use of `.nvmrc` files to ensure that the correct version
of node is used while developing. This version is specified by the currently supported
version for [Firebase Functions](https://firebase.google.com/docs/functions/manage-functions?gen=2nd#set_nodejs_version).

## Project structure

Follow the [Angular Style Guide](https://angular.dev/style-guide#style-04-06)
example for how to structure the files in the application.

## Linting

Use `ng lint` to inspect the entire code base.

Use `eslint --fix [FILE_PATH]` to apply automatic fixes to specific files or paths.

Use `npm run stylelint` to inspect the SCSS files in the entire code base.

Use `stylelint [FILE_PATH] --fix` to apply automatic fixes to specific files or
paths.

## Testing

The test suite uses the Firebase Emulator for tests. So you _cannot_ use `ng test`
directly. Instead use `npm run test` which will run `ng test` as an executable
script for `firebase emulator:exec`.

> [!TIP]
> See [Firebase Init](firebase-init.md) and [Java Install](developer-java-install.md)
> for a bit more information about setting up the emulators.

There is also `npm run test:once` for single test runs including code coverage.
And there is `npm run test:export` which will update the `fixtures/` directory
in the project root with the final state of the Firebase Emulator on exit.

> [!TIP]
> Updating `firestore.rules` or `storage.rules` will cause the emulator to update:
>
> ```text
> i  firestore: Change detected, updating rules...
> ✔  firestore: Rules updated.
> ```
>
> But it will not cause the Angular test suite to re-run. So you will need to
> refresh the test browser window after editing rules.

## Updating Dependencies

First use `ng update` to see what Angular updates are available. This may also
update some of your `ng add` dependencies like `@angular/fire`. However it generally
does not update workspace dependencies like `rxjs` or `typescript`.

Use `npm outdated` to see all the possible updates for the dependencies being used.
Generally you can run `npm update <dependency>` for the "Wanted" column changes
that fit within the `package.json` version selectors. Before doing so for any
Angular workspace dependencies you should check what the version of Angular (&
CLI) you are using wants. You can check the current released [workspace
dependencies](https://github.com/angular/angular-cli/blob/19.2.0/packages/schematics/angular/utility/latest-versions/package.json)
for Angular CLI to know what is approved for updating.
