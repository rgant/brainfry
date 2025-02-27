# Steps for generating icons

[How to Favicon in 2025: Three files that fit most needs](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

## icon.svg

Add `<style>` for darkmode alternative

## Favicon

```sh
magick raw-assets/graduation-cap-solid.svg -define icon:auto-resize=32,16 public/favicon.ico
```

## Apple Touch Icon

```sh
magick raw-assets/graduation-cap-solid.svg -resize 140x140 -gravity center -extent 180x180 public/apple-touch-icon.png
```

## Web app manifest Icons

```sh
magick raw-assets/graduation-cap-solid.svg -resize 192x192 public/icons/icon-192.png
magick raw-assets/graduation-cap-solid.svg -resize 512x512 public/icons/icon-512.png
magick raw-assets/graduation-cap-solid.svg -resize 320x320 -gravity center -extent 512x512 public/icons/icon-mask.png
```
