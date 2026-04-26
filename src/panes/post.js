/**
 * post.js — pane for ActivityStreams Note (microblog-shape post).
 *
 * Shape (any of these key forms):
 *   { "@type": "as:Note",
 *     "as:content": "Hello world",
 *     "as:attributedTo": { "@id": "https://alice.example.org/profile#me" },
 *     "as:published": "2026-04-26T12:34:56Z" }
 *
 * Renders the note as a card with author avatar, content, and date.
 * Edit-in-place for content, debounced save. SLIP-48 / LOSOS shape.
 */

import { putJsonLd, deleteResource, POST_CLASSES, valueOf, fetchWebIdProfile } from "../pod.js";
import { ICON, escape, fmtRel, debounce, showToast, initials, avatarHTML } from "../ui.js";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const AS_NS = "https://www.w3.org/ns/activitystreams#";
const AS_NS_HTTP = "http://www.w3.org/ns/activitystreams#";

export const label = "Post";
export const icon  = "💬";
export const meta = {
  id: "hub-pod/post",
  name: "ActivityStreams Note",
  forClasses: POST_CLASSES,
};

export function canHandle(subject, store) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!store?.statementsMatching) return false;
  const stmts = store.statementsMatching(subject, undefined, undefined);
  return stmts.some(s => {
    if (s.predicate?.value !== RDF_TYPE) return false;
    const v = s.object?.value;
    return POST_CLASSES.includes(v) ||
           v === "Note" || v === "as:Note" ||
           (typeof v === "string" && /[#/]Note$/.test(v) && /activitystreams/i.test(v));
  });
}

function rd(obj, ...keys) {
  if (!obj) return undefined;
  for (const k of keys) if (obj[k] !== undefined) return obj[k];
  return undefined;
}

const CONTENT_KEYS = ["as:content", "content", AS_NS + "content", AS_NS_HTTP + "content"];
const AUTHOR_KEYS = ["as:attributedTo", "attributedTo", AS_NS + "attributedTo", AS_NS_HTTP + "attributedTo"];
const PUBLISHED_KEYS = ["as:published", "published", AS_NS + "published", AS_NS_HTTP + "published"];

export async function render(subject, _store, container, rawData) {
  const url = subject?.value;
  const doc = rawData;
  if (!doc) {
    container.innerHTML = `<div class="empty">Failed to load post</div>`;
    return;
  }

  let content   = rd(doc, ...CONTENT_KEYS) || "";
  const author    = valueOf(rd(doc, ...AUTHOR_KEYS)) || "";
  const published = rd(doc, ...PUBLISHED_KEYS);

  injectStyles();

  // Initial render — author shows as a placeholder (just the WebID
  // hostname) and gets upgraded with profile data once it arrives.
  draw({ name: shortHost(author) || "Anonymous", img: null });

  if (author) {
    fetchWebIdProfile(author).then(profile => {
      if (profile) draw({
        name: profile.name || shortHost(author) || "Anonymous",
        img: profile.img,
      });
    }).catch(() => { /* leave placeholder */ });
  }

  function draw(authorMeta) {
    container.innerHTML = `
      <div class="post-card">
        <div class="post-head">
          ${avatarHTML(authorMeta, "sm")}
          <div class="post-head-info">
            <div class="post-author">${escape(authorMeta.name)}</div>
            ${author ? `<div class="post-author-id">${escape(author)}</div>` : ""}
          </div>
          ${published ? `<div class="post-time">${escape(fmtRel(published))}</div>` : ""}
          <button class="btn danger" id="post-del" title="Delete">${ICON.trash}</button>
        </div>
        <textarea class="post-content" id="post-content" placeholder="Write a note…">${escape(content)}</textarea>
        <div class="post-foot">
          <span id="post-status" class="post-saved">in sync</span>
          <span style="margin-left:auto;color:var(--text-faint);font-family:var(--mono);font-size:11px">${escape(url)}</span>
        </div>
      </div>
    `;
    container.querySelector("#post-content").addEventListener("input", save);
    container.querySelector("#post-del").addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;
      try {
        await deleteResource(url.replace(/#.*$/, ""));
        showToast("Deleted", "success");
        container.dispatchEvent(new CustomEvent("pane:delete", { detail: { url } }));
      } catch (e) {
        showToast("Delete failed: " + e.message, "error");
      }
    });
  }

  const save = debounce(async () => {
    const newContent = container.querySelector("#post-content")?.value ?? content;
    if (newContent === content) return;
    content = newContent;
    const contentKey = CONTENT_KEYS.find(k => doc[k] !== undefined) || "as:content";
    doc[contentKey] = newContent;
    setStatus("saving");
    try {
      await putJsonLd(url.replace(/#.*$/, ""), doc);
      setStatus("saved");
      container.dispatchEvent(new CustomEvent("pane:change", { detail: { url, doc } }));
    } catch (e) {
      setStatus("err", e.message);
    }
  }, 600);

  function setStatus(kind, msg) {
    const el = container.querySelector("#post-status");
    if (!el) return;
    if (kind === "saving") { el.className = "post-saving"; el.textContent = "saving…"; }
    else if (kind === "saved") { el.className = "post-saved"; el.textContent = "in sync"; }
    else if (kind === "err") { el.className = "post-err"; el.textContent = "save error: " + (msg || ""); }
  }
}

function shortHost(webid) {
  if (!webid) return null;
  try { return new URL(webid).hostname; }
  catch { return null; }
}

function injectStyles() {
  if (document.getElementById("post-pane-css")) return;
  const s = document.createElement("style");
  s.id = "post-pane-css";
  s.textContent = `
.post-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; box-shadow: var(--shadow); }
.post-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.post-head .ava { width: 36px; height: 36px; font-size: 13px; flex-shrink: 0; }
.post-head-info { flex: 1; min-width: 0; }
.post-author { font-weight: 600; font-size: 14px; color: var(--text); }
.post-author-id { font-size: 11px; color: var(--text-faint); font-family: var(--mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.post-time { font-size: 12px; color: var(--text-dim); flex-shrink: 0; }
.post-content { width: 100%; min-height: 96px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 8px; padding: 12px; font: 14px/1.5 var(--sans); color: var(--text); outline: none; resize: vertical; transition: border-color .12s, box-shadow .12s; }
.post-content:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.post-foot { display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 12px; }
.post-saved { color: var(--good); }
.post-saving { color: var(--warning); }
.post-err { color: var(--danger); }
`;
  document.head.appendChild(s);
}

export default { label, icon, canHandle, render };
