/**
 * Photos — discovers image collections via solid:publicTypeIndex.
 *
 * Looks for any TypeRegistration whose `forClass` is a known image class
 * (schema:ImageGallery, schema:Photograph, schema:Photo, schema:ImageObject,
 * foaf:Image). For each registration:
 *   - solid:instanceContainer → list the LDP container, render image-typed
 *     resources directly as <img> thumbnails.
 *   - solid:instance → fetch the JSON-LD doc and render whatever images it
 *     describes (foaf:depiction / schema:image / schema:contentUrl).
 *
 * No hardcoded /hub/photos/ — Photos shows what your pod says it has.
 */

import {
  fetchTypeIndex, findRegistrations, IMAGE_CLASSES,
  listContainer, getJsonLd, valueOf,
  createGallery,
} from "../pod.js";
import { findFor } from "../panes.js";
import { ICON, escape, $, $$, requireSolid, showToast } from "../ui.js";

let typeIndex = null;
let galleries = [];   // [{ url, label, images: [{src, title?}] }]

export function sidebar(ctx) {
  return `
    <div class="sidebar-head"><h2>Photos</h2></div>
    <div class="sidebar-body" id="photos-sb">
      <div style="padding:14px;color:var(--text-faint);font-size:13px">Loading…</div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Photos discovers image collections via solid:publicTypeIndex.")) return;

  container.innerHTML = `<div class="content">
    <div style="padding:18px 22px;border-bottom:1px solid var(--line)">
      <h1 style="margin:0;font-size:22px;letter-spacing:-.01em">Photos</h1>
      <div id="photos-status" style="color:var(--text-dim);font-size:13px;margin-top:4px">Discovering image collections…</div>
    </div>
    <div id="photos-body"><div class="spinner"></div></div>
  </div>`;

  galleries = [];
  try {
    typeIndex = await fetchTypeIndex(ctx.auth.id);
  } catch (e) {
    $("#photos-body").innerHTML = `<div class="page-pad"><div class="card" style="color:var(--text-dim)">
      <div style="color:var(--danger);margin-bottom:8px"><strong>Couldn't read your TypeIndex.</strong></div>
      <div style="font-size:13px">${escape(e.message)}</div>
    </div></div>`;
    $("#photos-status").textContent = "TypeIndex not available";
    renderSidebar();
    return;
  }

  const regs = typeIndex.registrations.filter(r =>
    IMAGE_CLASSES.includes(r.forClass) && (r.instance || r.instanceContainer)
  );
  $("#photos-status").innerHTML = regs.length
    ? `${regs.length} image registration${regs.length === 1 ? "" : "s"} discovered via <code style="color:var(--accent)">${escape(typeIndex.typeIndexUrl)}</code>`
    : "No image registrations in your TypeIndex yet";

  if (!regs.length) {
    $("#photos-body").innerHTML = `<div class="page-pad"><div class="card" style="color:var(--text-dim);text-align:center;padding:32px 24px;max-width:640px;margin:0 auto">
      <div style="font-size:15px;color:var(--text);margin-bottom:6px">No image collections yet.</div>
      <div style="font-size:13px;margin-bottom:18px">Hub will create a container under <code>/hub/photos/</code> on your pod and register it as a <code>schema:ImageGallery</code> instance container in your TypeIndex. Drop images into the folder afterwards (any pod-aware file tool).</div>
      <button class="btn primary" id="empty-new-gallery-btn">${ICON.plus} Create your first gallery</button>
      <div style="margin-top:18px;font-size:12px;color:var(--text-faint)">Or add a TypeRegistration manually with one of: ${IMAGE_CLASSES.map(c => `<code>${escape(c)}</code>`).join(", ")}</div>
    </div></div>`;
    $("#empty-new-gallery-btn").addEventListener("click", () => promptCreateGallery(ctx));
    renderSidebar();
    return;
  }

  // Resolve each registration into a gallery
  galleries = await Promise.all(regs.map(resolveGallery));
  drawGalleries();
  renderSidebar();
}

async function resolveGallery(reg) {
  // instanceContainer: list LDP container, filter for image MIME types
  if (reg.instanceContainer) {
    try {
      const items = await listContainer(reg.instanceContainer);
      const images = items
        .filter(it => it.type === "resource" && /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(it.url))
        .map(it => ({ src: it.url, title: decodeURIComponent(it.url.split("/").pop()) }));
      return {
        url: reg.instanceContainer,
        label: shortLabel(reg.instanceContainer, "container"),
        kind: "container",
        images,
      };
    } catch (e) {
      return { url: reg.instanceContainer, label: shortLabel(reg.instanceContainer, "container"), kind: "container", images: [], error: e.message };
    }
  }
  // instance: fetch the JSON-LD doc, look for image references
  try {
    const doc = await getJsonLd(reg.instance.replace(/#.*$/, ""));
    return {
      url: reg.instance,
      label: shortLabel(reg.instance, "instance"),
      kind: "instance",
      images: extractImagesFromDoc(doc),
    };
  } catch (e) {
    return { url: reg.instance, label: shortLabel(reg.instance, "instance"), kind: "instance", images: [], error: e.message };
  }
}

/**
 * Pull image URLs out of an arbitrary JSON-LD doc. Looks for foaf:depiction,
 * schema:image, schema:contentUrl, or any URL-valued key whose name matches
 * `image` / `photo`. Walks @graph too.
 */
function extractImagesFromDoc(doc) {
  if (!doc) return [];
  const found = [];
  const PIC_KEYS = /^(image|photo|depiction|contentUrl|thumbnail|hasPhoto|img)$/i;
  const PIC_PREDS_FULL = /(foaf\/0\.1\/(?:depiction|img)|schema\.org\/(?:image|contentUrl|thumbnail|photo))/i;
  const walk = (x) => {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) { x.forEach(walk); return; }
    for (const [k, v] of Object.entries(x)) {
      const localName = k.includes(":") || k.includes("/") ? k.split(/[/:]/).pop() : k;
      if (PIC_KEYS.test(localName) || PIC_PREDS_FULL.test(k)) {
        const items = Array.isArray(v) ? v : [v];
        for (const item of items) {
          const id = valueOf(item);
          if (typeof id === "string" && /\.(png|jpe?g|gif|webp|svg|avif)/i.test(id)) {
            found.push({ src: id, title: id.split("/").pop().split("?")[0] });
          }
        }
      }
      if (typeof v === "object") walk(v);
    }
  };
  walk(doc);
  return found;
}

function drawGalleries() {
  const body = $("#photos-body");
  if (!body) return;
  const total = galleries.reduce((s, g) => s + g.images.length, 0);
  if (total === 0) {
    body.innerHTML = `<div class="page-pad"><div class="card" style="color:var(--text-dim)">
      <strong>${galleries.length} image collection${galleries.length === 1 ? "" : "s"} registered</strong>, but no images found inside.
      <div style="font-size:13px;margin-top:8px">${galleries.map(g => `
        <div style="padding:6px 0;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:12px">
          <div>${escape(g.label)} <span style="color:var(--text-faint)">· ${g.kind}</span></div>
          <div style="word-break:break-all;color:var(--text-faint);font-size:11px">${escape(g.url)}</div>
          ${g.error ? `<div style="color:var(--danger);font-size:11px">${escape(g.error)}</div>` : ""}
        </div>
      `).join("")}</div>
    </div></div>`;
    return;
  }
  // Render gallery sections; per-image rendering delegates to PhotoPane.
  body.innerHTML = "";
  galleries.forEach((g, i) => {
    if (g.images.length === 0) return; // hide empty galleries when others have content
    const section = document.createElement("div");
    section.style.padding = "18px 22px";
    section.style.borderBottom = "1px solid var(--line)";
    section.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:10px">
        <h3 style="margin:0;font-size:14px;font-weight:600">${escape(g.label)}</h3>
        <span style="color:var(--text-faint);font-size:11px;font-family:var(--mono)">${g.images.length} image${g.images.length === 1 ? "" : "s"} · ${escape(g.kind)}</span>
      </div>
    `;
    const grid = document.createElement("div");
    grid.className = "photos-grid";
    grid.style.padding = "0";
    section.appendChild(grid);
    g.images.forEach(img => {
      const input = { url: img.src, doc: { title: img.title } };
      const pane = findFor(input);
      const tile = document.createElement("div");
      grid.appendChild(tile);
      if (pane) pane.render(input, tile);
      else tile.outerHTML = `<div class="photo" data-src="${escape(img.src)}"><img src="${escape(img.src)}" loading="lazy"></div>`;
    });
    body.appendChild(section);
  });
}

function renderSidebar() {
  const sb = $("#photos-sb");
  if (!sb) return;
  if (!typeIndex) {
    sb.innerHTML = `<div style="padding:14px;color:var(--text-faint);font-size:13px">No TypeIndex.</div>`;
    return;
  }
  if (!galleries.length) {
    sb.innerHTML = `
      <div class="sb-section">
        <div class="sb-label">Discovered</div>
        <div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">No image registrations</div>
      </div>
      <div class="sb-section">
        <div class="sb-label">TypeIndex</div>
        <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${escape(typeIndex.typeIndexUrl)}</div>
      </div>
    `;
    return;
  }
  sb.innerHTML = `
    <div class="sb-section">
      <div class="sb-label">Galleries</div>
      ${galleries.map((g, i) => `
        <button class="sb-item" data-scroll="${i}">
          ${ICON.photos}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escape(g.label)}</span>
          <span class="count">${g.images.length}</span>
        </button>
      `).join("")}
    </div>
    <div class="sb-section">
      <div class="sb-label">TypeIndex</div>
      <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${escape(typeIndex.typeIndexUrl)}</div>
    </div>
  `;
  $$("[data-scroll]", sb).forEach(el => el.addEventListener("click", () => {
    const idx = +el.dataset.scroll;
    const cards = $$("#photos-body > div");
    cards[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

function shortLabel(url, kind) {
  if (!url) return "(unknown)";
  try {
    if (kind === "container") {
      // /a/b/c/  →  "c"
      const parts = url.replace(/\/$/, "").split("/");
      return decodeURIComponent(parts[parts.length - 1] || url);
    }
    // .../foo-data.jsonld#this  →  "foo"
    return url.split("#")[0].split("/").pop()
      .replace(/-data\.jsonld$/, "")
      .replace(/\.jsonld$/, "");
  } catch { return url; }
}

async function promptCreateGallery(ctx) {
  const name = prompt("Gallery name (e.g. \"Travel\", \"2026\"):");
  if (!name || !name.trim()) return;
  showToast("Creating gallery…");
  try {
    await createGallery({ webid: ctx.auth.id, name: name.trim() });
    showToast("Gallery created", "success");
    ctx.switchApp("photos");
  } catch (e) {
    showToast("Create failed: " + e.message, "error");
  }
}

export const meta = { id: "photos", name: "Photos", icon: ICON.photos, hasSidebar: true };
