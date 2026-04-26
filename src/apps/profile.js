/**
 * Profile app — fetches your WebID, normalizes it, and delegates the
 * editable hero card to PersonPane (mode: "full"). Chrome-only here.
 */

import { fetchWebIdProfile, getJsonLd } from "../pod.js";
import { findFor } from "../panes.js";
import { ICON, escape, renderSpinner, renderEmpty, $, requireSolid } from "../ui.js";

const FOAF_PERSON = "http://xmlns.com/foaf/0.1/Person";

export function sidebar(ctx) {
  return `
    <div class="sidebar-head"><h2>Profile</h2></div>
    <div class="sidebar-body">
      <div class="sb-section">
        <div class="sb-label">WebID</div>
        <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${escape(ctx.auth.id || "(not signed in)")}</div>
      </div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Profile reads and edits your WebID document — that's a Solid-only concept.")) return;

  container.innerHTML = `<div class="content"><div class="page-pad" id="profile-page"></div></div>`;
  const page = $("#profile-page");
  renderSpinner(page);

  const webIdUrl = ctx.auth.id;
  let profile, raw;
  try {
    profile = await fetchWebIdProfile(webIdUrl);
    raw = await getJsonLd(webIdUrl.replace(/#.*$/, ""));
  } catch (e) {
    renderEmpty(page, { title: "Couldn't load profile", body: e.message });
    return;
  }
  if (!profile) { renderEmpty(page, { title: "WebID returned no profile data" }); return; }

  const input = { url: webIdUrl, doc: { profile, raw, mode: "full" }, forClass: FOAF_PERSON };
  const pane = findFor(input);
  if (!pane) {
    renderEmpty(page, { title: "No pane registered for foaf:Person" });
    return;
  }

  await pane.render(input, page, ctx);
}

export const meta = { name: "Profile", icon: ICON.user, hasSidebar: true };
