/**
 * Profile — read + edit your WebID document.
 *
 * Mirrors pilot's approach: fetch WebID as JSON-LD, normalize foaf/vcard
 * predicates to bare keys, click-to-edit, PUT back preserving any other
 * subject fields.
 */

import { fetchWebIdProfile, getJsonLd, putJsonLd, findSubject, valueOf } from "../pod.js";
import { authFetch } from "../auth.js";
import { ICON, escape, initials, showToast, renderSpinner, renderEmpty, avatarHTML, $$, $, requireSolid } from "../ui.js";

const FIELDS = [
  { key: "name",     label: "Name",     pred: "http://xmlns.com/foaf/0.1/name" },
  { key: "nick",     label: "Nick",     pred: "http://xmlns.com/foaf/0.1/nick" },
  { key: "email",    label: "Email",    pred: "http://xmlns.com/foaf/0.1/mbox", mailto: true },
  { key: "homepage", label: "Homepage", pred: "http://xmlns.com/foaf/0.1/homepage" },
  { key: "img",      label: "Avatar",   pred: "http://xmlns.com/foaf/0.1/img" },
];

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

  let profile, raw, webIdUrl;
  try {
    webIdUrl = ctx.auth.id;
    profile = await fetchWebIdProfile(webIdUrl);
    raw = await getJsonLd(webIdUrl.replace(/#.*$/, ""));
  } catch (e) {
    renderEmpty(page, { title: "Couldn't load profile", body: e.message });
    return;
  }
  if (!profile) { renderEmpty(page, { title: "WebID returned no profile data" }); return; }

  draw();

  function draw() {
    page.innerHTML = `
      <div class="card">
        <div class="profile-hero">
          ${avatarHTML(profile, "lg")}
          <div class="info">
            <h1>${escape(profile.name || "Unnamed")}</h1>
            <div class="webid">${escape(profile["@id"] || webIdUrl)}</div>
            <div class="profile-fields">
              ${FIELDS.map(f => fieldRow(f)).join("")}
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <h2>${ICON.code} Raw subject (JSON-LD)</h2>
        <pre style="font-family:var(--mono);font-size:12px;color:var(--text-dim);overflow:auto;max-height:280px;background:var(--bg-elev-2);padding:14px 16px;border-radius:8px;border:1px solid var(--line)">${escape(JSON.stringify(findSubject(raw, webIdUrl.includes("#") ? webIdUrl.split("#")[1] : null), null, 2))}</pre>
      </div>
    `;
    $$(".profile-field").forEach(el => el.addEventListener("click", () => beginEdit(el)));
  }

  function fieldRow(f) {
    const v = profile[f.key];
    return `
      <div class="profile-field" data-key="${f.key}">
        <div class="lbl">${f.label}</div>
        <div class="val ${v ? "" : "empty"}">${v ? escape(v) : "(click to add)"}</div>
      </div>
    `;
  }

  function beginEdit(el) {
    const key = el.dataset.key;
    const f = FIELDS.find(x => x.key === key);
    const cur = profile[key] || "";
    const valEl = el.querySelector(".val");
    valEl.innerHTML = `<input type="text" value="${escape(cur)}" />`;
    const input = valEl.querySelector("input");
    input.focus();
    input.select();
    const finish = (commit) => {
      if (!commit) { draw(); return; }
      const newVal = input.value.trim();
      saveField(f, newVal);
    };
    input.addEventListener("blur", () => finish(true));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      if (e.key === "Escape") { input.removeEventListener("blur", finish); draw(); }
    });
  }

  async function saveField(f, value) {
    const subj = findSubject(raw, webIdUrl.includes("#") ? webIdUrl.split("#")[1] : null);
    if (value) {
      // For email, normalize back to mailto:
      let stored = (f.mailto && !value.startsWith("mailto:")) ? "mailto:" + value : value;
      // Use the bare key first if it already exists; otherwise the full IRI
      const existingKey = Object.keys(subj).find(k => /(?:foaf|name|nick|email|mbox|homepage|img|depiction)/i.test(k) && k.includes(f.key));
      const writeKey = existingKey || (f.key === "email" ? "http://xmlns.com/foaf/0.1/mbox" : f.pred);
      // Preserve as @id for IRIs (homepage/img/email-mailto), as plain string for literals (name/nick)
      if (f.key === "name" || f.key === "nick") {
        subj[writeKey] = stored;
      } else {
        subj[writeKey] = { "@id": stored };
      }
    } else {
      // remove
      ["foaf:" + f.key, f.pred, f.key].forEach(k => { delete subj[k]; });
    }
    profile[f.key] = value || undefined;
    showToast("Saving…");
    try {
      await putJsonLd(webIdUrl.replace(/#.*$/, ""), raw);
      showToast("Saved", "success");
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    }
    draw();
  }
}

export const meta = { name: "Profile", icon: ICON.user, hasSidebar: true };
