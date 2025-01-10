# Steps for generating icons

[How to Favicon in 2024: Three files that fit most needs](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

## icon.svg

Add `<style>` for darkmode alternative

## Favicon

```sh
magick raw-assets/graduation-cap-solid.svg -define icon:auto-resize=32,16 public/favicon.ico
```
