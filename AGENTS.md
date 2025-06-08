# Repository Guidance for Future Agents

This repository hosts the static web site **ajlane.id.au**. It is intentionally simple—there is no build process or framework. All pages load directly from the repository content.

The page is a dynamically updating Voronoi visualisation. By default it shows a shifting gradient, but it may also sample colours from an image on drag and drop. a small site logo fades in in the bottom right corner.

## Structure
- `index.htm` – main HTML page containing a small amount of inline CSS and script tags.
- `js/background.js` – JavaScript that renders a WebGL animation on a `<canvas>` element.
- `logo.png` – site logo referenced by `index.htm`.
- `CNAME` – domain configuration for GitHub Pages. This rarely needs changes.

## Style notes
- Use two spaces for indentation in HTML and JavaScript.
- Keep JavaScript in `background.js` wrapped in the existing IIFE pattern.
- Avoid adding heavy dependencies—keep the site lightweight and easily served as static files.

## Change records
Plan all changes as ADR

## Pull requests
Describe changes clearly. If you modify files, cite the relevant line numbers in your PR summary. There is no formal changelog, so commit messages should be concise but descriptive.

