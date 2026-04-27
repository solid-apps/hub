/**
 * motd.js — Today's message + picture, live.
 *
 * One JSON-LD doc on your pod (default: /public/motd.jsonld) with a
 * headline, body, and image URL. The app fetches it, renders a hero
 * card, and subscribes to server-pushed change notifications. When
 * anyone with write access updates the doc — you, a friend, a cron
 * job — every open hub window cross-fades to the new version, no
 * reload.
 *
 * The demo of demos: the pod is the live source of truth, hub is the
 * window. Open this in two browsers, run a shell loop that PUTs new
 * content, watch them sync.
 */

export const meta = {
  id:         "demo-motd",
  name:       "Today",
  icon:       "🌅",
  hasSidebar: false,
};

const SCHEMA = "https://schema.org/";
const SCHEMA_ALT = "http://schema.org/";

export async function render(container, ctx) {
  injectStyles();

  const url = await resolveMotdUrl(ctx);
  if (!url) {
    container.innerHTML = empty("Sign in to a Solid pod to use Today.", "");
    return;
  }

  let unsubscribe = null;
  let lastImageUrl = null;

  await draw();

  // Subscribe to live updates. If the pod doesn't expose Updates-Via
  // (e.g. NSS without --notifications, or a static host), this no-ops.
  try {
    unsubscribe = await ctx.subscribe?.(url, () => draw());
  } catch { /* best-effort */ }

  // Cleanup when the app's container is detached (rail switch).
  const observer = new MutationObserver(() => {
    if (!container.isConnected) {
      try { unsubscribe?.(); } catch {}
      observer.disconnect();
    }
  });
  if (container.parentNode) observer.observe(container.parentNode, { childList: true });

  async function draw() {
    let doc, status;
    try {
      const r = await ctx.fetch(url, { cache: "reload", headers: { Accept: "application/ld+json" } });
      status = r.status;
      if (r.status === 404) {
        renderSeed(container, url, ctx, draw);
        return;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      doc = await r.json();
    } catch (e) {
      container.innerHTML = empty("Couldn't load today's message", `${escape(e.message)}\n${escape(url)}`);
      return;
    }

    const subj = findSubject(doc);
    const headline = pick(subj, "schema:headline", "headline", SCHEMA + "headline", SCHEMA_ALT + "headline", "schema:name", "name");
    const text     = pick(subj, "schema:text", "text", SCHEMA + "text", SCHEMA_ALT + "text", "schema:description", "description");
    const image    = idOf(pick(subj, "schema:image", "image", SCHEMA + "image", SCHEMA_ALT + "image"));
    const date     = pick(subj, "schema:datePublished", "datePublished", SCHEMA + "datePublished", SCHEMA_ALT + "datePublished");
    const author   = pick(subj, "schema:author", "author", SCHEMA + "author", SCHEMA_ALT + "author");

    const isFresh = lastImageUrl !== null && lastImageUrl !== image;
    lastImageUrl = image;

    container.innerHTML = `
      <div class="content"><div class="motd-wrap ${isFresh ? "motd-fresh" : ""}">
        <div class="motd-card">
          ${image
            ? `<div class="motd-imgwrap"><img class="motd-img" src="${escape(image)}" alt="${escape(headline || "today")}" /></div>`
            : `<div class="motd-imgwrap motd-noimg">🌅</div>`}
          <div class="motd-body">
            <div class="motd-headline">${escape(headline || "Today")}</div>
            ${text ? `<div class="motd-text">${escape(text)}</div>` : ""}
            <div class="motd-foot">
              ${author ? `<span class="motd-author">${escape(idOf(author) || author)}</span>` : ""}
              ${date ? `<span class="motd-date">${escape(fmtDate(date))}</span>` : ""}
              <span class="motd-live" title="Live — pushes to every open window">● live</span>
              <button class="motd-edit" id="motd-edit" title="Edit today's MOTD">Edit</button>
            </div>
          </div>
        </div>
        <div class="motd-source">${escape(url)}</div>
      </div></div>
    `;

    container.querySelector("#motd-edit")?.addEventListener("click", () => {
      renderEditor(container, url, doc, subj, ctx, draw);
    });
  }
}

async function resolveMotdUrl(ctx) {
  const auth = ctx?.auth;
  if (!auth?.loggedIn || !auth.id) return null;
  // Default location: <pod-root>/public/motd.jsonld. Walk the WebID for
  // pim:storage; fall back to origin if not present.
  try {
    const r = await ctx.fetch(auth.id.replace(/#.*$/, ""), { headers: { Accept: "application/ld+json" } });
    if (r.ok) {
      const profile = await r.json();
      const subj = findSubject(profile);
      const storage = idOf(pick(subj, "pim:storage", "storage", "http://www.w3.org/ns/pim/space#storage"));
      if (storage) return new URL("public/motd.jsonld", storage).href;
    }
  } catch { /* fall through */ }
  return new URL("/public/motd.jsonld", auth.id).href;
}

function renderSeed(container, url, ctx, redraw) {
  container.innerHTML = `
    <div class="content"><div class="motd-wrap">
      <div class="motd-card motd-seed">
        <div class="motd-imgwrap motd-noimg">🌅</div>
        <div class="motd-body">
          <div class="motd-headline">Set today's message</div>
          <div class="motd-text">There's no MOTD on your pod yet. Hub will create one at <code>${escape(url)}</code>. Drop in a headline and a picture URL.</div>
          <div class="motd-form">
            <input id="motd-h" placeholder="Headline" />
            <input id="motd-i" placeholder="Image URL (https://…)" />
            <textarea id="motd-t" placeholder="Body (optional)"></textarea>
            <button class="motd-save" id="motd-save">Publish</button>
          </div>
        </div>
      </div>
    </div></div>
  `;
  container.querySelector("#motd-save").addEventListener("click", async () => {
    const headline = container.querySelector("#motd-h").value.trim() || "Today";
    const image    = container.querySelector("#motd-i").value.trim();
    const text     = container.querySelector("#motd-t").value.trim();
    const doc = {
      "@context": "https://schema.org/",
      "@id": "#motd",
      "@type": "CreativeWork",
      "headline": headline,
      "text": text,
      "image": { "@id": image },
      "datePublished": new Date().toISOString(),
    };
    try {
      const r = await ctx.fetch(url.replace(/#.*$/, ""), {
        method: "PUT",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify(doc),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await redraw();
    } catch (e) {
      alert("Couldn't publish: " + e.message);
    }
  });
}

function renderEditor(container, url, doc, subj, ctx, redraw) {
  const headline = pick(subj, "schema:headline", "headline", "schema:name", "name") || "";
  const text     = pick(subj, "schema:text", "text", "schema:description", "description") || "";
  const image    = idOf(pick(subj, "schema:image", "image")) || "";
  container.innerHTML = `
    <div class="content"><div class="motd-wrap">
      <div class="motd-card motd-seed">
        <div class="motd-imgwrap motd-noimg">✏️</div>
        <div class="motd-body">
          <div class="motd-headline">Edit today's MOTD</div>
          <div class="motd-text">PUTs to <code>${escape(url)}</code>. Anyone watching this URL will see the change live.</div>
          <div class="motd-form">
            <input id="motd-h" placeholder="Headline" value="${escape(headline)}" />
            <input id="motd-i" placeholder="Image URL" value="${escape(image)}" />
            <textarea id="motd-t" placeholder="Body">${escape(text)}</textarea>
            <div style="display:flex;gap:8px">
              <button class="motd-save" id="motd-save">Publish</button>
              <button class="motd-save motd-cancel" id="motd-cancel">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div></div>
  `;
  container.querySelector("#motd-cancel").addEventListener("click", redraw);
  container.querySelector("#motd-save").addEventListener("click", async () => {
    const newDoc = {
      ...doc,
      "headline": container.querySelector("#motd-h").value.trim(),
      "text":     container.querySelector("#motd-t").value.trim(),
      "image":    { "@id": container.querySelector("#motd-i").value.trim() },
      "datePublished": new Date().toISOString(),
    };
    try {
      const r = await ctx.fetch(url.replace(/#.*$/, ""), {
        method: "PUT",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify(newDoc),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      // Don't manually redraw — the WS subscription will trigger it.
      // But fall back if no WS:
      setTimeout(redraw, 600);
    } catch (e) {
      alert("Couldn't publish: " + e.message);
    }
  });
}

function empty(title, body) {
  return `<div class="content"><div class="motd-wrap"><div class="motd-card motd-seed">
    <div class="motd-imgwrap motd-noimg">🌅</div>
    <div class="motd-body">
      <div class="motd-headline">${escape(title)}</div>
      ${body ? `<div class="motd-text" style="white-space:pre-line">${escape(body)}</div>` : ""}
    </div>
  </div></div></div>`;
}

function findSubject(doc) {
  if (!doc) return {};
  if (Array.isArray(doc?.["@graph"])) return doc["@graph"][0] || {};
  return doc;
}
function pick(o, ...keys) {
  if (!o) return undefined;
  for (const k of keys) if (o[k] !== undefined) return o[k];
  return undefined;
}
function idOf(v) {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && v["@id"]) return v["@id"];
  return null;
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return String(iso); }
}
function escape(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function injectStyles() {
  if (document.getElementById("motd-app-css")) return;
  const s = document.createElement("style");
  s.id = "motd-app-css";
  s.textContent = `
.motd-wrap { padding: 28px 24px; max-width: 880px; margin: 0 auto; }
.motd-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow); display: flex; flex-direction: column; }
.motd-imgwrap { width: 100%; aspect-ratio: 16/8; background: var(--bg-elev-2); display: grid; place-items: center; overflow: hidden; }
.motd-img { width: 100%; height: 100%; object-fit: cover; transition: opacity .8s ease, transform .8s ease; }
.motd-noimg { font-size: 60px; color: var(--text-faint); }
.motd-body { padding: 22px 28px 26px; }
.motd-headline { font: 700 28px/1.2 var(--sans); letter-spacing: -.02em; color: var(--text); }
.motd-text { font: 16px/1.6 var(--sans); color: var(--text-dim); margin-top: 10px; white-space: pre-line; }
.motd-foot { display: flex; align-items: center; gap: 12px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--line); font: 12px var(--mono); color: var(--text-faint); flex-wrap: wrap; }
.motd-author { color: var(--text-dim); }
.motd-date { color: var(--text-dim); }
.motd-live { display: inline-flex; align-items: center; gap: 4px; color: var(--good); font-weight: 500; }
.motd-edit { margin-left: auto; background: transparent; border: 1px solid var(--line); border-radius: 6px; color: var(--text-dim); cursor: pointer; padding: 4px 10px; font: 12px var(--mono); transition: border-color .12s, color .12s; }
.motd-edit:hover { border-color: var(--accent); color: var(--accent); }
.motd-source { margin-top: 14px; font: 12px var(--mono); color: var(--text-faint); word-break: break-all; }

.motd-fresh .motd-img { animation: motd-fade 0.8s ease; }
@keyframes motd-fade { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }

.motd-seed .motd-imgwrap { aspect-ratio: 16/4; }
.motd-form { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.motd-form input, .motd-form textarea { background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; color: var(--text); font: 14px var(--sans); outline: none; transition: border-color .12s, box-shadow .12s; }
.motd-form textarea { min-height: 80px; resize: vertical; font-family: var(--sans); }
.motd-form input:focus, .motd-form textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.motd-save { background: linear-gradient(135deg, var(--accent), var(--accent-2, var(--accent))); color: var(--text-on-accent, white); border: none; border-radius: 9px; padding: 10px 18px; font: 600 14px var(--sans); cursor: pointer; transition: transform .08s; }
.motd-save:hover { transform: translateY(-1px); }
.motd-cancel { background: var(--bg-elev-2); color: var(--text-dim); }
`;
  document.head.appendChild(s);
}
