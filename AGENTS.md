# Repository Guidance for Future Agents

This repository hosts the static web site **ajlane.id.au**. It is intentionally simple—there is no build process or framework. All pages load directly from the repository content.

## Structure
- `index.htm` – main HTML page containing a small amount of inline CSS and script tags.
- `js/background.js` – JavaScript that renders a WebGL animation on a `<canvas>` element.
- `logo.png` – site logo referenced by `index.htm`.
- `CNAME` – domain configuration for GitHub Pages. This rarely needs changes.

## Local testing
To preview the site locally, run a simple HTTP server from the repository root:

```bash
python3 -m http.server
```

Then browse to `http://localhost:8000` and confirm the page loads without console errors. There are no automated tests.

## Style notes
- Use two spaces for indentation in HTML and JavaScript.
- Keep JavaScript in `background.js` wrapped in the existing IIFE pattern.
- Avoid adding heavy dependencies—keep the site lightweight and easily served as static files.

## Pull requests
Describe changes clearly. If you modify files, cite the relevant line numbers in your PR summary. There is no formal changelog, so commit messages should be concise but descriptive.

