/**
 * Settings — theme, identity, pod info.
 */

import { discoverStorage, hubRoot } from "../pod.js";
import { logout } from "../auth.js";
import { ICON, escape, $, $$ } from "../ui.js";

export async function render(container, ctx) {
  let storage = null;
  if (ctx.auth.loggedIn) storage = await discoverStorage(ctx.auth.id).catch(() => null);

  const theme = document.documentElement.getAttribute("data-theme") || "dark";

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

      <div class="set-section">
        <h2>Schema</h2>
        <div class="set-row"><div><div class="lbl">Notes</div><div class="desc">schema.org TextDocument</div></div><div class="val">/hub/notes/&lt;id&gt;.jsonld</div></div>
        <div class="set-row"><div><div class="lbl">Tasks</div><div class="desc">wf:Tracker, SolidOS shape #1 (embedded issue array)</div></div><div class="val">/hub/tasks/list.jsonld</div></div>
        <div class="set-row"><div><div class="lbl">Calendar</div><div class="desc">ical:Vevent</div></div><div class="val">/hub/calendar/&lt;id&gt;.jsonld</div></div>
        <div class="set-row"><div><div class="lbl">Photos</div><div class="desc">image/* binaries (no JSON-LD wrapper)</div></div><div class="val">/hub/photos/</div></div>
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
