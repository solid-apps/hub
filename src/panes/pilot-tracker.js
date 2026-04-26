/**
 * pilot-tracker.js — bridge pane that delegates to pilot's
 * tracker-pane.js (drag-drop kanban, Preact). Opt-in alternative to
 * hub-pod's built-in `tracker.js`.
 *
 * This shows that an external LOSOS-style pane can plug in via the
 * registry. The bridge:
 *   1. Lazy-loads https://solid-apps.github.io/pilot/tracker-pane.js
 *      (uses the importmap in index.html for `preact` / `preact/hooks` / `htm`).
 *   2. Adapts hub-pod's pane input { url, doc, forClass } to pilot's
 *      LOSOS interface render(subject, store, container, rawData).
 *
 * Visually different from the built-in tracker pane — pilot ships its
 * own .tp-* styles tuned for a light theme.
 */

import { TRACKER_CLASS } from "../pod.js";
import { escape } from "../ui.js";

export const meta = {
  id: "pilot/tracker",
  name: "Pilot tracker (drag-drop kanban)",
  forClass: TRACKER_CLASS,
};

export function canHandle(input) {
  if (input?.forClass === TRACKER_CLASS) return true;
  const t = input?.doc?.["@type"];
  if (typeof t === "string") return /(^|[#/])Tracker$/i.test(t);
  if (Array.isArray(t)) return t.some(x => typeof x === "string" && /(^|[#/])Tracker$/i.test(x));
  return false;
}

let pilotMod = null;
async function loadPilot() {
  if (pilotMod) return pilotMod;
  pilotMod = await import("https://solid-apps.github.io/pilot/tracker-pane.js");
  return pilotMod;
}

export async function render(input, container, _ctx) {
  const { url, doc } = input;
  try {
    const mod = await loadPilot();
    // Pilot's render(subject, store, container, rawData) — pass the URL as
    // subject.value (pilot strips the fragment for its PUTs); store unused
    // by render itself; pass our doc as rawData so it doesn't re-fetch.
    mod.render({ value: url }, null, container, doc);
  } catch (e) {
    container.innerHTML = `
      <div class="card" style="color:var(--danger);max-width:640px">
        <strong>Couldn't load pilot's tracker pane.</strong>
        <div style="margin-top:8px;font-size:13px;font-family:var(--mono);word-break:break-all">${escape(e.message)}</div>
        <div style="margin-top:8px;font-size:13px;color:var(--text-dim)">Disable the pilot pane in Settings to fall back to the built-in tracker.</div>
      </div>
    `;
  }
}
