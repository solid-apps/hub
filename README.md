# hub

A multi-app workspace for your Solid pod. Profile, Files, Calendar, Contacts, Notes, Tasks, Photos — all stored as JSON-LD on a pod you own.

The UI is the [Linked Objects Hub](https://linkedobjects.org/demo/hub/) demo, wired to real data via [xlogin](https://unpkg.com/xlogin) + JSON-LD CRUD. Tasks discover trackers through your `solid:publicTypeIndex` (same convention as [pilot](https://github.com/solid-apps/pilot) and SolidOS' tracker-pane); other apps default to `/hub/` on your pod and can be moved by editing your TypeIndex.

Live: <https://solid-apps.github.io/hub/>

Status: **early — read paths solid, write paths exercised but not exhaustively tested.**

## Stack

- Vanilla JS, ESM modules, no build step
- [xlogin](https://github.com/melvincarvalho/xlogin) for Solid OIDC auth (DPoP-authenticated `fetch` via `window.xlogin.authFetch`)
- Pod requirement: serves `application/ld+json` via content negotiation. Turtle-only pods aren't supported yet.

## Running locally

```sh
python3 -m http.server 8080
# or any static file server, e.g.
npx serve .
```

Open `http://localhost:8080/`. Click the floating Login button (xlogin) to sign in to your pod.

## Apps

| App        | Status     | Pod path                  | Vocab                   |
|------------|------------|---------------------------|-------------------------|
| Home       | dashboard  | (synthesized)             | —                       |
| Profile    | read+edit  | WebID document            | foaf, vcard             |
| Files      | browse     | `/hub/files/`             | LDP                     |
| Calendar   | read+edit  | `/hub/calendar/`          | ical                    |
| Contacts   | read       | discovered from WebID     | foaf                    |
| Notes      | read+edit  | `/hub/notes/`             | schema.org TextDocument |
| Tasks      | read+edit  | `/hub/tasks/list.jsonld`  | wf:Tracker (SolidOS #1) |
| Photos     | browse     | `/hub/photos/`            | LDP, schema.org         |
| Activity   | feed       | (synthesized)             | —                       |
| Settings   | UI         | `/hub/prefs.jsonld`       | hub: namespace          |

## Pane convention

Apps own chrome and discovery; per-subject rendering is delegated to **panes**. A pane is a small module:

```js
export const meta = { id, name, forClass };          // optional, for debugging

export function canHandle(input) { /* boolean */ }   // input: { url, doc, forClass }
export async function render(input, container, ctx); // emit DOM into container
```

Built-in panes live under `src/panes/`. To plug in a new one:

```js
import { register } from './panes.js';
import * as MyPane from './panes/my-pane.js';
register(MyPane);
```

Apps look up a pane per discovered subject via `findFor(input)`. The first registered pane whose `canHandle` returns true wins, so registering an external pane *before* the built-in one swaps the renderer without touching the app shell.

`src/panes/pilot-tracker.js` is a worked example: it lazy-loads pilot's `tracker-pane.js` (a LOSOS-style Preact pane), adapts hub-pod's input shape to pilot's `render(subject, store, container, rawData)`, and replaces the built-in tracker pane when toggled on in Settings → Panes. The pilot pane brings its own `.tp-*` styles, so it looks different — that's intentional.

## License

AGPL-3.0-or-later.
