# hub as a JSS mashlib

Hub can be served by JSS as the default data browser via the `--mashlib-module` flag — your pod renders as the hub workspace instead of mashlib's classic UI, with **type-aware pane rendering** for individual resources.

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

Open `http://localhost:5446/public/`. JSS injects the wrapper, the wrapper loads `hub-mashlib.js`, the bundle hijacks the page and renders hub focused on `/public/`. Navigate to any JSON-LD resource on your pod (e.g. `/public/note-1.jsonld`) and hub dispatches to the pane that claims its `@type` — NotePane for `schema:Note`, EventPane for `schema:Event`, ListPane for `schema:ItemList`, and so on.

## Build

```bash
npm install
npm run build:mashlib
```

Produces `hub-mashlib.js` (~220 KB minified, ~57 KB gzipped). One esbuild invocation, ~15 ms. The build script (`package.json`):

```
esbuild src/mashlib.js
  --bundle
  --format=esm
  --loader:.css=text     # inline style.css into the JS bundle
  --target=es2022
  --minify
  --outfile=hub-mashlib.js
```

`preact` and `htm` are bundled in (no external importmap needed for the core, though one is injected at runtime for external Preact panes that load via `urn:solid:view`).

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

1. **Marks mashlib mode** (`window.__hubMashlibActive = true`) so other modules know to behave accordingly
2. **Captures the data island** (`window.__hubMashlib = { uri, data }`) *before* `buildShell` wipes the DOM
3. **Injects an importmap** for external Preact panes
4. **Injects hub's CSS** as a `<style>` tag (CSS bundled as JS string via `--loader:.css=text`)
5. **Builds hub's shell DOM** into `<body>`
6. **Installs a URL-driven topbar breadcrumb** that updates on every `history.pushState` / `replaceState` / `popstate`
7. **Registers a synthetic Resource app** before importing hub's app.js — reads the data island's `@type` and resolves the matching pane via `ctx.resolvePane` / `ctx.findPane`
8. **Picks an initial app from the URL**:
   - `/` or empty path → Home
   - `/profile/...` → Profile
   - container path (trailing slash) → Files (focused on the URL)
   - non-container resource → Resource (type-aware pane)
9. **Loads xlogin** from CDN (pinned to `0.0.12`)
10. **Imports hub's app.js**, then re-clicks the rail item for the URL-derived app — necessary because hub's `onAuth` listener fires immediately on subscribe and would otherwise reset to Home

## URL-as-truth in mashlib mode

In mashlib mode the browser URL is a real Solid URI. Hub adapts:

- **`switchApp` does NOT write `#<app>` to the URL** — the URL fragment identifies an RDF subject within the document, not app state, and polluting it breaks Solid URI semantics
- **The topbar shows a URL-derived breadcrumb** (`localhost:5446 / public / tracker / work-data.jsonld`), each segment clickable to navigate up — replaces hub's "hub-pod / Files" title
- **Files updates the URL on each navigation** via `history.pushState(currentDir)` — clicking around the file tree updates the address bar to the actual container URL (shareable, bookmarkable)
- **Clicking a file tile uses `location.href = url`** (same-tab nav) so JSS serves the mashlib wrapper for the new URL and hub re-bootstraps with the matching pane

The Files app also defaults to **`/public/`** (the load-bearing public container) when no specific URL is given, with sidebar shortcuts for Pod root, Public, and hub-pod data.

## Hosting

The bundle must be served with `Access-Control-Allow-Origin: *` because JSS loads it cross-origin. GitHub Pages does this by default; jsdelivr too.

Public URL (after merge to `gh-pages`): `https://solid-apps.github.io/hub/hub-mashlib.js`.

For local development:

```bash
# Serve the bundle locally with CORS enabled
npx http-server --cors -p 8004 -c-1 .

# Point JSS at it
jss start --port 5446 --root ./pod-data --idp --notifications \
  --mashlib-module http://localhost:8004/hub-mashlib.js
```

## Type-aware Resource app

The Resource app reads the data island, extracts `@type`, expands `schema:Foo` → `https://schema.org/Foo`, and asks hub's pane registry for a handler:

```js
const input = { url: m.uri, doc: m.data, forClass: expanded };
const pane = await ctx.resolvePane(input) || ctx.findPane(input);
await pane.render(input, container, ctx);
```

Hub's built-in panes claim:

| `@type` | Pane |
|---|---|
| `schema:Note` | NotePane |
| `schema:Event` | EventPane |
| `schema:Photo`, `schema:ImageObject` | PhotoPane |
| `schema:Person`, `foaf:Person` | PersonPane |
| `schema:Bookmark` | BookmarkPane |
| `schema:SocialMediaPosting` | PostPane |
| `schema:ItemList` | ListPane |
| `ldp:Container` | ContainerPane (full view) / FileTilePane (in-listing) |
| `ldp:Resource` | FileTilePane (in-listing) |

If no pane claims the `@type`, the Resource app shows a fallback with the raw JSON-LD.

External panes can be loaded via `urn:solid:view` on a TypeRegistration — same mechanism hub already uses outside of mashlib mode.

## Known limits

- **Private resources via direct URL navigation hit 401** — top-level navigation can't send DPoP-signed Authorization headers, so JSS returns 401 for ACL-protected resources. Workaround: browse via Files (which uses `authFetch` for the container listing) and click tiles from there. A future fix could intercept link clicks and authFetch inline.
- **No data-island reuse for the first fetch** — Resource app uses the data island, but Files still re-fetches the container even when the JSON-LD is sitting in `window.__hubMashlib.data`. Easy win.
- **The `<div id="mashlib">` element JSS injects is ignored** — we wipe the whole body. A future tighter integration could mount into that div.
- **No source maps** in the production bundle — add `--sourcemap` to the build script when debugging.
- **CSS chunk 404s** — JSS pre-fetches `<bundle>.css` and `<chunk>.mashlib.min.js` as siblings; both return 404 because the bundle is self-contained. Harmless console noise.

## Compared to classic mashlib

What hub-mashlib has that classic mashlib doesn't:

- Multi-app rail (Calendar, Contacts, Tasks, Photos, etc.) — workspace surface
- Modern UI, dark/light theme
- Nostr identity (via xlogin) in addition to Solid-OIDC
- Smaller bundle (~57 KB gzipped vs mashlib's ~300 KB)

What classic mashlib has that hub-mashlib doesn't (yet):

- Inline ACL editor
- Raw RDF source view
- Full `@type` → pane resolution from URL alone for every Solid vocabulary
- Info sidebar with resource metadata
- Inline resource creation for arbitrary types
- Mounts into `<div id="mashlib">` (we wipe the body)

Hub-mashlib is positioned as a **workspace mashlib** — better for non-technical pod owners ("show me my photos / calendar / notes"), partial as a generic data browser for RDF power users.
