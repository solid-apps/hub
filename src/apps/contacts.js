/**
 * Contacts — read FOAF friends from your WebID.
 *
 * Reads `foaf:knows` from the WebID document, fetches each WebID's profile
 * for name/avatar, renders as a card grid. Click a card to view that
 * person's WebID URL (links out for now).
 */

import { fetchWebIdProfile, getJsonLd, findSubject, valueOf } from "../pod.js";
import { findFor } from "../panes.js";
import { ICON, escape, initials, renderSpinner, renderEmpty, $, $$, avatarHTML, requireSolid } from "../ui.js";

const FOAF_PERSON = "http://xmlns.com/foaf/0.1/Person";

const FOAF_NS = "http://xmlns.com/foaf/0.1/";

export function sidebar(ctx) {
  return `
    <div class="sidebar-head"><h2>Contacts</h2></div>
    <div class="sidebar-body">
      <div class="sb-section">
        <button class="sb-item active">${ICON.contacts} <span>People you know</span><span class="count" id="contact-count">…</span></button>
      </div>
      <div class="sb-section">
        <div class="sb-label">Source</div>
        <div style="padding:6px 18px;font-size:12px;color:var(--text-dim);line-height:1.5">
          Pulled from <code>foaf:knows</code> on your WebID document.
        </div>
      </div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Contacts reads foaf:knows from your WebID document.")) return;
  container.innerHTML = `<div class="content"><div id="contacts-page"><div class="page-pad"><h1>Contacts</h1><p class="lede">Loading your foaf:knows network…</p></div></div></div>`;
  const page = $("#contacts-page");

  let webIds = [];
  try {
    const url = ctx.auth.id.replace(/#.*$/, "");
    const doc = await getJsonLd(url);
    if (!doc) { renderEmpty(page, { title: "Couldn't fetch WebID" }); return; }
    const subj = findSubject(doc, ctx.auth.id.includes("#") ? ctx.auth.id.split("#")[1] : null);
    const knows = subj["foaf:knows"] ?? subj[FOAF_NS + "knows"] ?? subj["knows"];
    if (knows) {
      const arr = Array.isArray(knows) ? knows : [knows];
      webIds = arr.map(k => valueOf(k)).filter(Boolean);
    }
  } catch (e) {
    renderEmpty(page, { title: "Couldn't load contacts", body: e.message });
    return;
  }

  $("#contact-count").textContent = webIds.length;

  if (!webIds.length) {
    page.innerHTML = `<div class="page-pad">
      <h1>Contacts</h1>
      <p class="lede">No contacts found.</p>
      <div class="login-banner" style="margin-top:24px">
        <div class="ico">${ICON.contacts}</div>
        <div class="info">
          <strong>To add contacts</strong>
          <span>Edit your WebID profile and add <code>foaf:knows</code> entries pointing at other WebIDs. They'll appear here automatically.</span>
        </div>
      </div>
    </div>`;
    return;
  }

  page.innerHTML = `<div id="contacts-grid" style="padding:22px 24px"></div>`;
  const grid = $("#contacts-grid");

  // Resolve every WebID's profile in parallel; failed ones render with
  // null profile (PersonPane card-mode shows "Loading…" placeholder).
  const profiles = await Promise.all(
    webIds.map(wid => fetchWebIdProfile(wid).catch(() => null))
  );
  const items = webIds.map((wid, i) => ({
    url: wid,
    doc: { profile: profiles[i], mode: "card" },
    forClass: FOAF_PERSON,
  }));

  // Hand the items to the generic CollectionPane — it iterates and
  // delegates each card back through ctx.resolvePane to PersonPane.
  const collInput = { doc: { items, layout: "grid" } };
  const coll = findFor(collInput);
  if (coll) await coll.render(collInput, grid, ctx);
}

function loginPrompt() {
  return `<div class="content"><div class="page-pad">
    <div class="login-banner">
      <div class="ico">${ICON.contacts}</div>
      <div class="info"><strong>Sign in to see your contacts</strong><span>Contacts are pulled from <code>foaf:knows</code> on your WebID.</span></div>
    </div>
  </div></div>`;
}

export const meta = { id: "contacts", name: "Contacts", icon: ICON.contacts, hasSidebar: true };
