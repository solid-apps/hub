# hub as a JSS mashlib

Hub can be served by JSS as the default data browser via the `--mashlib-module` flag — your pod renders as the hub workspace instead of mashlib's classic UI.

## Try it

Start JSS pointed at the published bundle:

```bash
jss start \
  --port 5446 \
  --root ./pod-data \
  --idp \
  --notifications \
  --mashlib-module https://solid-apps.github.io/hub/hub-mashlib.js
```

Open `http://localhost:5446/public/`. JSS injects the wrapper, the wrapper loads `hub-mashlib.js`, the bundle hijacks the page and renders hub focused on `/public/`.

## How it works

JSS wraps every HTML response on Solid resources with:

```html
<head><link rel="stylesheet" href="<bundle>.css"></head>
<body>
  <script type="application/ld+json" id="dataisland" data-uri="<resource>">…</script>
  <div id="mashlib"></div>
  <script type="module" src="<bundle>"></script>
</body>
```

`src/mashlib.js` is the entry that:

1. Captures the data island (URL + JSON-LD) *before* wiping the DOM
2. Injects the importmap (for external Preact panes)
3. Injects hub's CSS as a `<style>` tag (CSS bundled as JS string via `--loader:.css=text`)
4. Builds hub's shell DOM
5. Picks an initial app from the URL (`/public/` → Files; `/` → Home)
6. Loads xlogin from CDN (pinned)
7. Dynamically imports `src/app.js` — the existing hub entry — which boots normally

Files reads `window.__hubMashlib.uri` on first render so it lands on the resource the user navigated to, not its default hub-pod-data location.

## Build

```bash
npm install
npm run build:mashlib
```

Produces `hub-mashlib.js` (~220 KB minified, ~57 KB gzipped). One esbuild invocation, ~10 ms.

## Hosting

The bundle must be served with `Access-Control-Allow-Origin: *` because JSS loads it cross-origin. GitHub Pages does this by default; jsdelivr too.

Public URL (after merge to `gh-pages`): `https://solid-apps.github.io/hub/hub-mashlib.js`.

## Known limits (v2 work)

- **Pure container view only** — Files reads the URL when it's a container. Per-`@type` apps (Photos for `schema:Photo`, Notes for `schema:Note`, etc.) don't yet claim from the data island's `@type`.
- **No data-island reuse for fetches** — Files still re-fetches the container even though the JSON-LD is sitting in `window.__hubMashlib.data`. Easy win: pass it as the seed.
- **The `<div id="mashlib">` element JSS injects is ignored** — we wipe the whole body. A future tighter integration could mount into that div without touching the rest.
- **No source maps** in the bundle — add `--sourcemap` to the build script when debugging.
