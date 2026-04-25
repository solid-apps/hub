# hub-pod

A multi-app workspace for your Solid pod. Profile, Files, Calendar, Contacts, Notes, Tasks, Photos — all stored as JSON-LD on a pod you own.

The UI is the [Linked Objects Hub](https://linkedobjects.org/demo/hub/) demo, wired to real data via [xlogin](https://unpkg.com/xlogin) + JSON-LD CRUD. Apps share an LDP-style layout under `/hub/` on your pod, and a TypeIndex registration so other Solid apps can discover the same data.

Status: **early local dev**. Not deployed yet.

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

## License

AGPL-3.0-or-later.
