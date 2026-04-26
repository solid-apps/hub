/**
 * person.js — pane for foaf:Person profiles.
 *
 * Two render modes via input.mode:
 *   - "full" (default): the editable hero card used by the Profile app.
 *     Click any field to edit; save on blur PUTs the WebID document
 *     back. (Note: on HTML WebID pods that's still a footgun — the
 *     full HTML page is replaced. A pilot-style island-preserving PUT
 *     is a future addition.)
 *   - "card": the compact card used by Contacts grid. Click → open the
 *     WebID URL in a new tab.
 *
 * Input:
 *   { url, doc?, profile?, raw?, forClass, mode, onChange? }
 *   - profile: normalized fields { name, nick, email, homepage, img, bio }
 *   - raw:     full WebID JSON-LD (needed for editable mode to PUT back)
 */

import { putJsonLd, findSubject } from "../pod.js";
import { ICON, escape, initials, showToast, $$, avatarHTML } from "../ui.js";

const FOAF_PERSON = "http://xmlns.com/foaf/0.1/Person";

export const meta = {
  id: "hub-pod/person",
  name: "Person profile",
  forClass: FOAF_PERSON,
};

export function canHandle(input) {
  if (input?.forClass === FOAF_PERSON) return true;
  const t = input?.doc?.["@type"] ?? input?.profile?.["@type"];
  const matches = (s) =>
    s === "Person" || s === "foaf:Person" || s === "schema:Person" ||
    (typeof s === "string" && /[#/]Person$/.test(s));
  if (typeof t === "string") return matches(t);
  if (Array.isArray(t)) return t.some(matches);
  return false;
}

export async function render(input, container, _ctx) {
  const mode = input.mode || "full";
  if (mode === "card") return renderCard(input, container);
  return renderFull(input, container);
}

const FIELDS = [
  { key: "name",     label: "Name",     pred: "http://xmlns.com/foaf/0.1/name" },
  { key: "nick",     label: "Nick",     pred: "http://xmlns.com/foaf/0.1/nick" },
  { key: "email",    label: "Email",    pred: "http://xmlns.com/foaf/0.1/mbox", mailto: true },
  { key: "homepage", label: "Homepage", pred: "http://xmlns.com/foaf/0.1/homepage" },
  { key: "img",      label: "Avatar",   pred: "http://xmlns.com/foaf/0.1/img" },
];

function renderFull(input, container) {
  const { url, profile, raw, onChange } = input;
  if (!profile) { container.innerHTML = `<div class="empty">No profile.</div>`; return; }

  draw();

  function draw() {
    container.innerHTML = `
      <div class="card">
        <div class="profile-hero">
          ${avatarHTML(profile, "lg")}
          <div class="info">
            <h1>${escape(profile.name || "Unnamed")}</h1>
            <div class="webid">${escape(profile["@id"] || url)}</div>
            <div class="profile-fields">
              ${FIELDS.map(fieldRow).join("")}
            </div>
          </div>
        </div>
      </div>
      ${raw ? `
        <div class="card">
          <h2>${ICON.code} Raw subject (JSON-LD)</h2>
          <pre style="font-family:var(--mono);font-size:12px;color:var(--text-dim);overflow:auto;max-height:280px;background:var(--bg-elev-2);padding:14px 16px;border-radius:8px;border:1px solid var(--line)">${escape(JSON.stringify(findSubject(raw, url.includes("#") ? url.split("#")[1] : null), null, 2))}</pre>
        </div>
      ` : ""}
    `;
    $$(".profile-field", container).forEach(el => el.addEventListener("click", () => beginEdit(el)));
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
    const inp = valEl.querySelector("input");
    inp.focus(); inp.select();
    inp.addEventListener("blur", () => saveField(f, inp.value.trim()));
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); inp.blur(); }
      if (e.key === "Escape") draw();
    });
  }

  async function saveField(f, value) {
    if (!raw) { showToast("No raw doc — can't save", "error"); draw(); return; }
    const subj = findSubject(raw, url.includes("#") ? url.split("#")[1] : null);
    if (value) {
      const stored = (f.mailto && !value.startsWith("mailto:")) ? "mailto:" + value : value;
      const existing = Object.keys(subj).find(k => /(?:foaf|name|nick|email|mbox|homepage|img|depiction)/i.test(k) && k.includes(f.key));
      const writeKey = existing || (f.key === "email" ? "http://xmlns.com/foaf/0.1/mbox" : f.pred);
      if (f.key === "name" || f.key === "nick") subj[writeKey] = stored;
      else subj[writeKey] = { "@id": stored };
    } else {
      ["foaf:" + f.key, f.pred, f.key].forEach(k => { delete subj[k]; });
    }
    profile[f.key] = value || undefined;
    showToast("Saving…");
    try {
      await putJsonLd(url.replace(/#.*$/, ""), raw);
      showToast("Saved", "success");
      onChange?.();
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    }
    draw();
  }
}

function renderCard(input, container) {
  const { url, profile } = input;
  const name = profile?.name || "Loading…";
  container.className = "contact-card";
  container.innerHTML = `
    ${profile?.img
      ? `<div class="ava"><img src="${escape(profile.img)}" alt="${escape(name)}" onerror="this.parentNode.textContent='${escape(initials(name))}'"></div>`
      : `<div class="ava">${escape(initials(name))}</div>`}
    <div class="name">${escape(name)}</div>
    <div class="webid">${escape(url)}</div>
  `;
  container.style.cursor = "pointer";
  container.addEventListener("click", () => window.open(url, "_blank"));
}
