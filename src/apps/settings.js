/**
 * Settings — theme, identity, pod info.
 */

import { discoverStorage, hubRoot, fetchTypeIndex, findRegistrations, TRACKER_CLASS, NOTE_CLASSES, CALENDAR_CLASSES, IMAGE_CLASSES } from "../pod.js";
import { logout } from "../auth.js";
import { ICON, escape, $, $$, showToast } from "../ui.js";
import { listRegistered, listExternal, loadAndRegister, getClassDefaults, setClassDefault } from "../panes.js";
import {
  list as listApps,
  listExternal as listExternalApps,
  loadAndRegister as loadAndRegisterApp,
  getExternalUrls as getAppUrls,
  removeExternal as removeExternalApp,
} from "../apps.js";

// Hosts considered "trusted" — no confirm prompt before loading a pane/app URL.
// Anything else triggers a warning since both get full DOM + xlogin access.
const TRUSTED_HOSTS = new Set(["solid-apps.github.io", "localhost", "127.0.0.1"]);
function confirmLoad(url, kind = "pane") {
  let host;
  try { host = new URL(url).hostname; }
  catch { return confirm(`Load this URL?\n\n${url}\n\nOnly proceed if you trust the source — ${kind}s get full DOM + xlogin access.`); }
  if (TRUSTED_HOSTS.has(host)) return true;
  return confirm(
    `Load and run code from ${host}?\n\n` +
    `${kind === "app" ? "Apps" : "Panes"} have full access to your DOM and to your pod (via xlogin.authFetch).\n` +
    `Only load URLs you trust.`
  );
}

export async function render(container, ctx) {
  let storage = null;
  let typeIndex = null;
  let typeIndexErr = null;
  if (ctx.auth.type === "solid") {
    storage = await discoverStorage(ctx.auth.id).catch(() => null);
    try { typeIndex = await fetchTypeIndex(ctx.auth.id); }
    catch (e) { typeIndexErr = e.message; }
  }

  const theme = document.documentElement.getAttribute("data-theme") || "light";

  container.innerHTML = `
    <div class="content"><div class="page-pad">
      <h1>Settings</h1>

      <div class="set-section">
        <h2>Appearance</h2>
        <div class="set-row">
          <div><div class="lbl">Theme</div><div class="desc">Light or dark.</div></div>
          <div class="toggle ${theme === "dark" ? "on" : ""}" id="theme-toggle"><div class="knob"></div></div>
        </div>
      </div>

      <div class="set-section">
        <h2>Panes</h2>
        <div class="set-row">
          <div>
            <div class="lbl">Use pilot's remote Tracker pane</div>
            <div class="desc">Off → use hub's <code>src/panes/tracker.js</code> (vendored from pilot, evolves independently here).<br/>On → load <a href="https://solid-apps.github.io/pilot/tracker-pane.js" target="_blank" style="color:var(--accent)">pilot's remote tracker-pane.js</a> at runtime instead. Useful for comparing hub's diverging copy against the upstream. Reload after toggling.</div>
          </div>
          <div class="toggle ${localStorage.getItem("hubpod-use-pilot-tracker") === "1" ? "on" : ""}" id="pilot-toggle"><div class="knob"></div></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:10px">Registered panes</div>
          <div class="desc" style="margin-bottom:12px">Built-in panes are loaded at boot from <code>src/panes/</code>. External panes are loaded on demand via <code>urn:solid:view</code> on a TypeRegistration. First-match wins inside <code>findFor()</code>; <code>urn:solid:view</code> takes precedence over both via <code>resolveFor()</code>.</div>
          <div id="panes-registered-list" style="background:var(--bg-elev-2);padding:10px 14px;border-radius:8px;border:1px solid var(--line);font-family:var(--mono);font-size:12px;line-height:1.6"></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:10px">Default pane per class</div>
          <div class="desc" style="margin-bottom:12px">When two or more panes can render the same RDF class, pick which one wins. Stored in localStorage. Pinning to a pane that's not currently loaded falls through to the next match.</div>
          <div id="panes-defaults-list" style="display:flex;flex-direction:column;gap:8px"></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:10px">External panes loaded this session</div>
          <div id="panes-external-list" style="background:var(--bg-elev-2);padding:10px 14px;border-radius:8px;border:1px solid var(--line);font-family:var(--mono);font-size:12px;line-height:1.6;color:var(--text-dim)"></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:8px">Load a pane URL</div>
          <div class="desc" style="margin-bottom:10px">Manually pull in an ES module that exports <code>canHandle</code> + <code>render</code> (hub-style or LOSOS-style). It'll be added to the registry with priority over the built-ins.</div>
          <div style="display:flex;gap:8px">
            <input id="pane-load-url" placeholder="https://example.org/my-pane.js" style="flex:1;background:var(--bg-elev);border:1px solid var(--line);border-radius:8px;padding:8px 12px;font-family:var(--mono);font-size:13px;color:var(--text);outline:none" />
            <button class="btn primary" id="pane-load-btn">Load</button>
          </div>
        </div>
      </div>

      <div class="set-section">
        <h2>Apps</h2>
        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:10px">Installed apps</div>
          <div class="desc" style="margin-bottom:12px">Built-ins ship with hub. Externals are ES modules loaded by URL on boot — they appear on the rail alongside built-ins. Each must export <code>render(container, ctx)</code> and a <code>meta</code> object with at least <code>id</code>, <code>name</code>, <code>icon</code>.</div>
          <div id="apps-registered-list" style="background:var(--bg-elev-2);padding:10px 14px;border-radius:8px;border:1px solid var(--line);font-family:var(--mono);font-size:12px;line-height:1.6"></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:8px">Add an app by URL</div>
          <div class="desc" style="margin-bottom:10px">URL is saved in localStorage and loaded on every boot. Reload after adding to see it on the rail.</div>
          <div style="display:flex;gap:8px">
            <input id="app-load-url" placeholder="https://example.org/my-app.js" style="flex:1;background:var(--bg-elev);border:1px solid var(--line);border-radius:8px;padding:8px 12px;font-family:var(--mono);font-size:13px;color:var(--text);outline:none" />
            <button class="btn primary" id="app-load-btn">Add</button>
          </div>
        </div>
      </div>

      <div class="set-section">
        <h2>Identity</h2>
        ${ctx.auth.loggedIn ? `
          <div class="set-row">
            <div>
              <div class="lbl">Signed in as</div>
              <div class="desc">${escape(ctx.auth.type)} session</div>
            </div>
            <div class="val">${escape(ctx.auth.id)}</div>
          </div>
          <div class="set-row">
            <div>
              <div class="lbl">Pod storage</div>
              <div class="desc">Discovered from your WebID's <code>pim:storage</code>, or origin fallback.</div>
            </div>
            <div class="val">${escape(storage || "(unknown)")}</div>
          </div>
          <div class="set-row">
            <div>
              <div class="lbl">hub-pod root</div>
              <div class="desc">Where this app stores its data on your pod.</div>
            </div>
            <div class="val">${escape(hubRoot(storage) || "(none)")}</div>
          </div>
          <div class="set-row">
            <div><div class="lbl">Sign out</div><div class="desc">Clear the local session.</div></div>
            <button class="btn danger" id="logout-btn">Logout</button>
          </div>
        ` : `
          <div class="set-row">
            <div><div class="lbl">Not signed in</div><div class="desc">Click the floating Login button (bottom-right) to sign in via xlogin.</div></div>
          </div>
        `}
      </div>

      ${ctx.auth.type === "solid" ? `
        <div class="set-section">
          <h2>TypeIndex</h2>
          ${typeIndex ? `
            <div class="set-row">
              <div><div class="lbl">Public TypeIndex</div><div class="desc">Where apps discover where your data lives.</div></div>
              <div class="val">${escape(typeIndex.typeIndexUrl)}</div>
            </div>
            <div class="set-row">
              <div><div class="lbl">Registrations</div><div class="desc">${typeIndex.registrations.length} total, ${findRegistrations(typeIndex, TRACKER_CLASS).length} for wf:Tracker.</div></div>
              <div class="val">${typeIndex.registrations.length}</div>
            </div>
            ${typeIndex.registrations.length ? `
              <div class="set-row" style="display:block">
                <div class="lbl" style="margin-bottom:8px">All registrations</div>
                <div style="background:var(--bg-elev-2);padding:10px 14px;border-radius:8px;border:1px solid var(--line);font-family:var(--mono);font-size:12px;line-height:1.6;color:var(--text-dim);max-height:280px;overflow-y:auto">
                  ${typeIndex.registrations.map(r => `
                    <div style="padding:6px 0;border-bottom:1px solid var(--line)">
                      <div><span style="color:var(--text-faint)">forClass:</span> ${escape(r.forClass)}</div>
                      ${r.instance ? `<div style="word-break:break-all"><span style="color:var(--text-faint)">instance:</span> ${escape(r.instance)}</div>` : ""}
                      ${r.instanceContainer ? `<div style="word-break:break-all"><span style="color:var(--text-faint)">instanceContainer:</span> ${escape(r.instanceContainer)}</div>` : ""}
                      ${r.view ? `<div style="word-break:break-all;color:var(--accent)"><span style="color:var(--text-faint)">urn:solid:view:</span> ${escape(r.view)}</div>` : ""}
                    </div>
                  `).join("")}
                </div>
              </div>
            ` : ""}
          ` : `
            <div class="set-row">
              <div>
                <div class="lbl" style="color:var(--danger)">TypeIndex not available</div>
                <div class="desc">${escape(typeIndexErr || "")}</div>
              </div>
            </div>
          `}
        </div>
      ` : ""}

      <div class="set-section">
        <h2>Discovery</h2>
        <div class="set-row" style="display:block">
          <div class="desc" style="margin-bottom:10px">Hub doesn't hardcode paths — every app reads from the registrations in your <code>solid:publicTypeIndex</code>. Add a <code>solid:TypeRegistration</code> with one of these <code>forClass</code> values to surface a container or document.</div>
        </div>
        <div class="set-row"><div><div class="lbl">Notes</div><div class="desc">${escape(NOTE_CLASSES.join(", "))}</div></div></div>
        <div class="set-row"><div><div class="lbl">Tasks</div><div class="desc">${escape(TRACKER_CLASS)} (SolidOS shape #1 — embedded issue array)</div></div></div>
        <div class="set-row"><div><div class="lbl">Calendar</div><div class="desc">${escape(CALENDAR_CLASSES.join(", "))}</div></div></div>
        <div class="set-row"><div><div class="lbl">Photos</div><div class="desc">${escape(IMAGE_CLASSES.join(", "))}</div></div></div>
      </div>

      <div class="set-section">
        <h2>About</h2>
        <div class="set-row">
          <div><div class="lbl">hub-pod</div><div class="desc">Hub UI wired to a Solid pod via xlogin + JSON-LD CRUD. AGPL-3.0.</div></div>
        </div>
      </div>
    </div></div>
  `;

  $("#theme-toggle")?.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("hubpod-theme", next);
    render(container, ctx); // re-render to flip the toggle
  });
  $("#pilot-toggle")?.addEventListener("click", () => {
    const cur = localStorage.getItem("hubpod-use-pilot-tracker") === "1";
    if (cur) localStorage.removeItem("hubpod-use-pilot-tracker");
    else localStorage.setItem("hubpod-use-pilot-tracker", "1");
    if (confirm((cur ? "Disabling" : "Enabling") + " pilot's Tracker pane requires a reload. Reload now?")) {
      window.location.reload();
    } else {
      render(container, ctx);
    }
  });

  // ---- Panes browser ----
  drawPanesLists();

  $("#pane-load-btn")?.addEventListener("click", async () => {
    const url = $("#pane-load-url")?.value.trim();
    if (!url) return;
    if (!confirmLoad(url, "pane")) return;
    const btn = $("#pane-load-btn");
    btn.disabled = true; btn.textContent = "Loading…";
    try {
      const pane = await loadAndRegister(url);
      showToast(`Loaded ${pane.meta?.name || pane.meta?.id || url}`, "success");
      $("#pane-load-url").value = "";
      drawPanesLists();
    } catch (e) {
      showToast("Load failed: " + e.message, "error");
    } finally {
      btn.disabled = false; btn.textContent = "Load";
    }
  });

  // ---- Apps browser ----
  drawAppsList();

  $("#app-load-btn")?.addEventListener("click", async () => {
    const url = $("#app-load-url")?.value.trim();
    if (!url) return;
    if (!confirmLoad(url, "app")) return;
    const btn = $("#app-load-btn");
    btn.disabled = true; btn.textContent = "Adding…";
    try {
      const app = await loadAndRegisterApp(url);
      showToast(`Added ${app.meta?.name || app.meta?.id || url} — reload to see it on the rail`, "success");
      $("#app-load-url").value = "";
      drawAppsList();
    } catch (e) {
      showToast("Add failed: " + e.message, "error");
    } finally {
      btn.disabled = false; btn.textContent = "Add";
    }
  });

  $("#logout-btn")?.addEventListener("click", () => logout());
}

function drawPanesLists() {
  const panes = listRegistered();
  const reg = $("#panes-registered-list");
  if (reg) {
    reg.innerHTML = panes.length === 0
      ? `<div style="color:var(--text-faint)">No panes registered.</div>`
      : panes.map((p, i) => `
          <div style="padding:6px 0;${i > 0 ? "border-top:1px solid var(--line);" : ""}">
            <div style="color:var(--text);font-weight:600">${escape(p.name || p.id || "(unnamed)")}</div>
            <div style="color:var(--text-faint);word-break:break-all">id: ${escape(p.id || "—")}</div>
            ${p.forClass ? `<div style="color:var(--text-faint);word-break:break-all">forClass: ${escape(p.forClass)}</div>` : ""}
            ${Array.isArray(p.forClasses) ? `<div style="color:var(--text-faint);word-break:break-all">forClasses: ${escape(p.forClasses.join(", "))}</div>` : ""}
          </div>
        `).join("");
  }

  // Class → which panes claim it (via meta.forClass / meta.forClasses).
  // Only classes with 2+ candidates get a picker; single-pane classes
  // would just show "auto + the one pane" which conveys no useful choice.
  const coverage = new Map();
  for (const p of panes) {
    const classes = [];
    if (typeof p.forClass === "string") classes.push(p.forClass);
    if (Array.isArray(p.forClasses)) classes.push(...p.forClasses);
    for (const c of classes) {
      if (!coverage.has(c)) coverage.set(c, []);
      coverage.get(c).push(p);
    }
  }
  const defaults = getClassDefaults();
  const picker = $("#panes-defaults-list");
  if (picker) {
    const multi = [...coverage.entries()].filter(([, ps]) => ps.length > 1);
    if (multi.length === 0) {
      picker.innerHTML = `<div style="color:var(--text-faint);font-size:13px">All classes currently have one pane each. Load another (URL box below, or via <code>urn:solid:view</code>) to enable picking.</div>`;
    } else {
      picker.innerHTML = multi.map(([cls, ps]) => `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <code style="font-size:12px;color:var(--text-dim);word-break:break-all;flex:1;min-width:200px">${escape(cls)}</code>
          <select data-default-class="${escape(cls)}" style="background:var(--bg-elev-2);border:1px solid var(--line);border-radius:8px;padding:6px 10px;font:inherit;font-size:13px;color:var(--text)">
            <option value="">auto · ${escape(ps[0].name || ps[0].id)}</option>
            ${ps.map(p => `<option value="${escape(p.id)}" ${defaults[cls] === p.id ? "selected" : ""}>${escape(p.name || p.id)}</option>`).join("")}
          </select>
        </div>
      `).join("");
      $$("[data-default-class]", picker).forEach(el => el.addEventListener("change", () => {
        setClassDefault(el.dataset.defaultClass, el.value || null);
      }));
    }
  }

  const ext = $("#panes-external-list");
  if (ext) {
    const cached = listExternal();
    if (cached.length === 0) {
      ext.innerHTML = `<span>None yet — set <code>urn:solid:view</code> on a TypeRegistration, or use the load box below.</span>`;
    } else {
      ext.innerHTML = cached.map((c, i) => `
        <div style="padding:6px 0;${i > 0 ? "border-top:1px solid var(--line);" : ""};color:var(--text-dim)">
          <div style="word-break:break-all;color:${c.loaded ? 'var(--good)' : 'var(--danger)'}">${c.loaded ? "✓" : "✗"} ${escape(c.url)}</div>
          ${c.meta?.name ? `<div style="color:var(--text-faint)">name: ${escape(c.meta.name)}</div>` : ""}
        </div>
      `).join("");
    }
  }
}

function drawAppsList() {
  const reg = $("#apps-registered-list");
  if (!reg) return;
  const apps = listApps();
  const externalUrls = new Set(getAppUrls());
  if (!apps.length) {
    reg.innerHTML = `<div style="color:var(--text-faint)">No apps registered.</div>`;
    return;
  }
  reg.innerHTML = apps.map((a, i) => {
    const url = a.meta?.__externalUrl;
    const isExternal = !!url && externalUrls.has(url);
    return `
      <div style="padding:8px 0;${i > 0 ? "border-top:1px solid var(--line);" : ""};display:flex;align-items:center;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="color:var(--text);font-weight:600">${escape(a.meta.name || a.meta.id || "(unnamed)")} ${isExternal ? `<span style="color:var(--text-faint);font-weight:400;font-size:11px">· external</span>` : `<span style="color:var(--text-faint);font-weight:400;font-size:11px">· built-in</span>`}</div>
          <div style="color:var(--text-faint);word-break:break-all">id: ${escape(a.meta.id || "—")}</div>
          ${url ? `<div style="color:var(--text-faint);word-break:break-all">${escape(url)}</div>` : ""}
        </div>
        ${isExternal ? `<button class="btn danger" data-app-remove="${escape(url)}" style="font-size:12px;padding:4px 10px">Remove</button>` : ""}
      </div>
    `;
  }).join("");
  $$("[data-app-remove]", reg).forEach(btn => btn.addEventListener("click", () => {
    const url = btn.dataset.appRemove;
    if (!confirm(`Remove this app?\n\n${url}\n\nIt'll disappear from the rail on next reload.`)) return;
    removeExternalApp(url);
    drawAppsList();
    showToast("App removed — reload to update the rail", "info");
  }));
}

export const meta = { id: "settings", name: "Settings", icon: ICON.settings, hasSidebar: false };
