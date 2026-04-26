/**
 * app.js — main entry. Builds the rail, switches apps, wires global keys.
 */

import { onAuth, getAuth, login, logout } from "./auth.js";
import { ICON, escape, $, $$, initials, showToast, avatarHTML } from "./ui.js";
import { fetchWebIdProfile } from "./pod.js";

import * as Home from "./apps/home.js";
import * as Profile from "./apps/profile.js";
import * as Files from "./apps/files.js";
import * as Calendar from "./apps/calendar.js";
import * as Contacts from "./apps/contacts.js";
import * as Notes from "./apps/notes.js";
import * as Tasks from "./apps/tasks.js";
import * as Photos from "./apps/photos.js";
import * as Activity from "./apps/activity.js";
import * as Store from "./apps/store.js";
import * as Settings from "./apps/settings.js";

import { register as registerApp, list as listApps, find as findApp, loadAllExternal, syncFromPod as syncAppsFromPod } from "./apps.js";
import { findFor as findPane, resolveFor as resolvePane, syncDefaultsFromPod, loadAllExternal as panesLoadAllExternal } from "./panes.js";

// Register built-in panes. External panes can register themselves via
// import('./panes.js').then(m => m.register(myPane)).
import * as TrackerPane      from "./panes/tracker.js";          // hub's local copy (vendored from pilot, LOSOS-shape)
import * as PilotTrackerPane from "./panes/pilot-tracker.js";    // remote pilot bridge (opt-in via localStorage)
import * as ListPane         from "./panes/list.js";             // schema:ItemList (vendored from SolidOS todo-pane)
import * as NotePane         from "./panes/note.js";
import * as EventPane        from "./panes/event.js";
import * as PhotoPane        from "./panes/photo.js";
import * as PersonPane       from "./panes/person.js";
import * as FilePane         from "./panes/file.js";
import * as CollectionPane   from "./panes/collection.js";
import { register as registerPane, adapt } from "./panes.js";

// Tracker pane priority:
//   1. urn:solid:view on a registration (handled at resolveFor time, not here)
//   2. Pilot's remote pane if the localStorage toggle is set (opt-in)
//   3. Hub's local copy — vendored from pilot, will evolve independently.
//      LOSOS-shape, so wrap with adapt() at register time.
if (localStorage.getItem("hubpod-use-pilot-tracker") === "1") {
  registerPane(PilotTrackerPane);
}
registerPane(adapt(TrackerPane, "hub-pod/tracker"));
registerPane(adapt(ListPane,    "hub-pod/list"));
registerPane(adapt(NotePane,    "hub-pod/note"));
registerPane(adapt(EventPane,   "hub-pod/event"));
registerPane(adapt(PhotoPane,   "hub-pod/photo"));
registerPane(adapt(PersonPane,  "hub-pod/person"));
registerPane(adapt(FilePane,    "hub-pod/file"));
registerPane(adapt(CollectionPane, "hub-pod/collection"));

// Built-in apps. Order here = rail order. External apps load via
// loadAllExternal() at boot and append to the registry.
[Home, Profile, Files, Calendar, Contacts, Notes, Tasks, Photos, Activity, Store, Settings]
  .forEach(mod => registerApp(mod));

const state = {
  app: "home",
  profile: null,
};

const ctx = {
  get auth() { return getAuth(); },
  switchApp,
  // Pane recursion: collection-shaped panes delegate per-item rendering
  // back through the host so the same urn:solid:view → user-pin → registry
  // cascade is honoured for children.
  findPane,
  resolvePane,
  // Authenticated fetch — DPoP-signed for Solid sessions, same as
  // pod.js uses internally. Panes that need their own GET/PUT calls
  // should prefer pod.js helpers, but this is the escape hatch.
  fetch: (...args) => (window.xlogin?.authFetch || fetch)(...args),
};

// ---- Rail ----------------------------------------------------------------

function buildRail() {
  const rail = $("#rail");
  const apps = listApps();
  rail.innerHTML = apps.map((a, i) => `
    <button class="rail-item ${a.meta.id === state.app ? "active" : ""}" data-app="${a.meta.id}" title="${escape(a.meta.name)}">
      ${a.meta.icon}
      <span class="rail-tip">${escape(a.meta.name)}${i < 9 ? ` <span class="kbd">${i + 1}</span>` : ""}</span>
    </button>
  `).join("");
  $$(".rail-item[data-app]").forEach(el => el.addEventListener("click", () => switchApp(el.dataset.app)));
}

function setRailActive() {
  $$(".rail-item[data-app]").forEach(el => el.classList.toggle("active", el.dataset.app === state.app));
}

// ---- Switching ----------------------------------------------------------

function switchApp(id) {
  const a = findApp(id);
  if (!a) return;
  state.app = id;
  setRailActive();
  history.replaceState(null, "", "#" + id);

  const sidebar = $("#sidebar");
  const main = $("#main");

  if (a.meta.hasSidebar && a.sidebar) {
    sidebar.style.display = "flex";
    main.classList.remove("main-no-sidebar");
    sidebar.innerHTML = a.sidebar(ctx);
  } else {
    sidebar.style.display = "none";
    main.classList.add("main-no-sidebar");
  }

  // Update topbar title
  $("#topbar-title").innerHTML = state.app === "home" ? "" :
    `<span class="crumb">hub-pod</span> / ${escape(a.meta.name)}`;

  Promise.resolve(a.render(main, ctx)).catch(e => {
    console.error("App render error:", e);
    main.innerHTML = `<div class="content"><div class="page-pad">
      <h1>Couldn't render ${escape(a.meta.name)}</h1>
      <p class="lede" style="color:var(--danger)">${escape(e.message)}</p>
    </div></div>`;
  });
}

// ---- Theme ---------------------------------------------------------------

function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("hubpod-theme", t);
  updateThemeIcon(t);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(cur === "dark" ? "light" : "dark");
}
function updateThemeIcon(t) {
  const ic = $("#theme-icon");
  if (!ic) return;
  ic.innerHTML = t === "light"
    ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
}

// ---- Auth pill ----------------------------------------------------------

async function renderAuthPill() {
  const slot = $("#auth-pill");
  if (!slot) return;
  const auth = getAuth();
  if (!auth.loggedIn) {
    slot.innerHTML = `<button class="btn primary" id="auth-login-btn">Sign in</button>`;
    $("#auth-login-btn").addEventListener("click", () => login());
    state.profile = null;
    return;
  }
  // Only Solid identities have a WebID profile we can fetch.
  if (auth.type === "solid" && (!state.profile || state.profile["@id"] !== auth.id)) {
    try { state.profile = await fetchWebIdProfile(auth.id); }
    catch { state.profile = null; }
  } else if (auth.type !== "solid") {
    state.profile = null;
  }
  const name = state.profile?.name
    || tryHostname(auth.id)
    || shortId(auth.id)
    || "you";
  const target = auth.type === "solid" ? "profile" : "settings";
  slot.innerHTML = `
    <span class="auth-pill" id="auth-pill-btn" title="${escape(auth.type)} session">
      <span class="ava">${state.profile?.img
        ? `<img src="${escape(state.profile.img)}" onerror="this.parentNode.textContent='${escape(initials(name))}'">`
        : escape(initials(name))}</span>
      <span class="name">${escape(name)}</span>
      <span class="label">${auth.type}</span>
    </span>
  `;
  $("#auth-pill-btn").addEventListener("click", () => switchApp(target));
}

function tryHostname(s) {
  try { return new URL(s).hostname; } catch { return null; }
}
function shortId(s) {
  if (!s) return null;
  return s.length > 16 ? s.slice(0, 6) + "…" + s.slice(-4) : s;
}

// ---- Spotlight (basic for now) -----------------------------------------

function openSpotlight() {
  $("#spot-bg").classList.add("on");
  setTimeout(() => $("#spot-input").focus(), 30);
  spotSearch("");
}
function closeSpotlight() {
  $("#spot-bg").classList.remove("on");
  $("#spot-input").value = "";
}
function spotSearch(q) {
  const ql = q.toLowerCase().trim();
  const hits = listApps().filter(a => !ql || a.meta.name.toLowerCase().includes(ql));
  $("#spot-results").innerHTML = hits.length
    ? hits.map(a => `<div class="spot-r" data-app="${a.meta.id}">
        <div style="width:28px;height:28px;border-radius:7px;background:var(--bg-elev-2);display:grid;place-items:center;color:var(--text-dim)">${a.meta.icon}</div>
        <div style="flex:1"><div style="font-weight:500">${escape(a.meta.name)}</div><div style="font-size:12px;color:var(--text-dim)">Open ${a.meta.name.toLowerCase()}</div></div>
      </div>`).join("")
    : `<div style="padding:30px;text-align:center;color:var(--text-faint);font-size:13px">No results for "${escape(q)}"</div>`;
  $$("#spot-results .spot-r").forEach((el, i) => {
    if (i === 0) el.classList.add("sel");
    el.addEventListener("click", () => { switchApp(el.dataset.app); closeSpotlight(); });
  });
}

// ---- Init ---------------------------------------------------------------

async function init() {
  // Theme
  const savedTheme = localStorage.getItem("hubpod-theme") || "light";
  setTheme(savedTheme);

  // Load any user-installed external apps and panes before building the rail.
  // Failures are logged inside each loader — never blocks boot.
  await Promise.all([loadAllExternal(), panesLoadAllExternal()]);

  $("#theme-btn").addEventListener("click", toggleTheme);
  $("#search-trigger").addEventListener("click", openSpotlight);

  $("#spot-bg").addEventListener("click", closeSpotlight);
  $("#spot-input").addEventListener("input", (e) => spotSearch(e.target.value));
  $("#spot-input").addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSpotlight();
    else if (e.key === "Enter") {
      const sel = $("#spot-results .sel") || $("#spot-results .spot-r");
      if (sel) sel.click();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const all = $$("#spot-results .spot-r");
      const idx = all.findIndex(el => el.classList.contains("sel"));
      const next = e.key === "ArrowDown" ? Math.min(all.length - 1, idx + 1) : Math.max(0, idx - 1);
      all.forEach(el => el.classList.remove("sel"));
      if (all[next]) { all[next].classList.add("sel"); all[next].scrollIntoView({ block: "nearest" }); }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSpotlight();
    } else if (e.key === "Escape") {
      closeSpotlight();
    } else if (e.key.toLowerCase() === "t") {
      toggleTheme();
    } else if (e.key >= "1" && e.key <= "9") {
      const a = listApps()[+e.key - 1];
      if (a) switchApp(a.meta.id);
    }
  });

  // Auth changes → re-render pill + current app
  onAuth(async () => {
    renderAuthPill();
    // Re-render current app so it can react to login/logout
    switchApp(state.app);

    // Sync apps list and pane defaults from pod once auth is known.
    // Apps changes prompt reload (rail composition); pane defaults
    // apply silently — they only affect future pane-resolution lookups.
    // Solid sessions only — Nostr-only sessions don't have a TypeIndex.
    const auth = getAuth();
    if (auth.loggedIn && auth.type === "solid") {
      try {
        const r = await syncAppsFromPod(auth.id);
        if (r.changed) {
          if (confirm(
            "Your pod's installed apps list differs from this browser's cache.\n\n" +
            `Pod has: ${r.items.length} app${r.items.length === 1 ? "" : "s"}\n` +
            "Reload to apply the pod's list?"
          )) window.location.reload();
        }
      } catch (e) {
        console.warn("apps sync from pod failed:", e);
      }
      try { await syncDefaultsFromPod(auth.id); }
      catch (e) { console.warn("pane defaults sync from pod failed:", e); }
    }
  });

  buildRail();

  // Initial app from URL fragment, default home
  const hash = location.hash.replace("#", "");
  switchApp(findApp(hash) ? hash : "home");

  // First-visit hint
  setTimeout(() => {
    if (!localStorage.getItem("hubpod-seen")) {
      showToast("⌘K to search · sign in via the floating button to use your pod");
      localStorage.setItem("hubpod-seen", "1");
    }
  }, 1000);
}

init();
