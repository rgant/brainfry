# Brainfry Pub Quiz App

![A brain wearing a graduation cap on a plate of fries](/public/imgs/logo-260.png)

## Developer Setup

There are two primary areas of this code:

1. Terraform Infrastructure as Code used to create the GCP Firebase project.
2. Angular Single Page Application

Install general dependencies:

```sh
brew install dprint git git-absorb git-machete
npm --global install markdownlint-cli prettier \
  @awmottaz/prettier-plugin-void-html \
  prettier-plugin-embed \
  prettier-plugin-multiline-arrays \
  prettier-plugin-organize-attributes \
  prettier-plugin-sh \
  prettier-plugin-sql-cst
```

To manage the application infrastructure see [Developer Setup Terraform Doc](docs/developer-setup-terraform.md)

To work on the Angular application see [Developer Setup Angular Doc](docs/developer-setup-angular.md)
