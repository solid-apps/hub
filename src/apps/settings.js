/**
 * Settings — theme, identity, pod info.
 */

import { discoverStorage, hubRoot, fetchTypeIndex, findRegistrations, TRACKER_CLASS, NOTE_CLASSES, CALENDAR_CLASSES, IMAGE_CLASSES } from "../pod.js";
import { logout } from "../auth.js";
import { ICON, escape, $, $$ } from "../ui.js";

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
  $("#logout-btn")?.addEventListener("click", () => logout());
}

export const meta = { name: "Settings", icon: ICON.settings, hasSidebar: false };
