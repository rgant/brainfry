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
