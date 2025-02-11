# Internal Documentation

Specific documentation for specialized tasks involved in setting up this project.

1. [Website Icon Generation Specs](create-website-icons.md)
2. Developer Environment Setup:
   1. [Infrastructure](developer-setup-terraform.md)
   2. [Angular](developer-setup-angular.md)
3. Firebase Tools Setups
   1. [Manual Configuration](firebase-manual-config.md) not handled by Terraform
   2. [Initalize Firebase](firebase-init.md)
   3. _Temporary_ [Firebase Hosting Setup](firebase-hosting-config.md)

## Code Coverage

Code coverage is setup in [karma.conf.js](/karma.conf.js). (Which was exported
using `ng generate config karma`.) The output is put into `./docs/coverage`, and
then served via [GitHub Pages](https://rgant.github.io/brainfry/coverage/index.html).

## Generated Code Documentation

Using Compodoc to generate documenation from the source code. It is also served
through [GitHub Pages](https://rgant.github.io/brainfry/documentation/index.html).

> [!TIP]
> This project is overly documented for educational purposes. Unless you are
> building a library it is probably not necessary to include documentation in
> your web application.
