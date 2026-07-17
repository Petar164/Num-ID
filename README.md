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

- `index.html` — the whole page (hero, stats, products, API demo, infrastructure, coverage globe, use-case matrix, resources, blog, contact)
- `assets/css/style.css` — design system (black #050505 / yellow #F2DF00 editorial split, hairline borders)
- `assets/js/main.js` — hero terminal loop, simulated API demo, use-case matrix filter, coverage globe, scrollspy, scroll reveals, mobile nav
- `assets/js/latency-data.js` — **per-country response times for the globe.** Currently empty, so every country shows a stable simulated number. Drop real measurements in `window.NUMID_LATENCY` (keyed by country name) and they take precedence — see the comments in that file.

The globe uses [globe.gl](https://globe.gl) + world-atlas country shapes, loaded from the jsDelivr CDN only when the section scrolls near the viewport. If the CDN or WebGL is unavailable the section degrades to a text fallback.
