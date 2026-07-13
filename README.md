# num-iD — marketing site

Static one-page site for num-iD (numerical intelligence for telecom), rebuilt from the Framer prototype (fuchsia-lots-936554.framer.app).

## Stack

Plain HTML + CSS + vanilla JS — no build step. Fonts: Inter and Geist Mono via Google Fonts.

## Run locally

Serve the folder with any static server, e.g.:

```
npx serve -l 3999 .
```

or open it through Laragon at `http://numid.test` / `http://localhost/numid`.

## Structure

- `index.html` — the whole page (hero, stats, products, API demo, infrastructure, use-case matrix, resources, blog, contact)
- `assets/css/style.css` — design system (dark #050505, accent #F2DF00, hairline borders)
- `assets/js/main.js` — hero terminal loop, simulated API demo, use-case matrix filter, scroll reveals, mobile nav
