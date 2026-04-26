/**
 * Files — browse LDP containers on the pod.
 *
 * Read-only for v1. Click a folder to navigate; click a file to open it
 * in a new tab (browser handles content-type).
 */

import { listContainer, hubRoot, discoverStorage } from "../pod.js";
import { findFor } from "../panes.js";
import { ICON, escape, fmtBytes, showToast, renderSpinner, renderEmpty, $, $$, requireSolid } from "../ui.js";

let storage = null;
let currentDir = null;

export function sidebar(ctx) {
  return `
    <div class="sidebar-head"><h2>Files</h2></div>
    <div class="sidebar-body">
      <div class="sb-section">
        <div class="sb-label">Locations</div>
        <button class="sb-item" data-go="storage">${ICON.files} <span>Pod root</span></button>
        <button class="sb-item active" data-go="hub">${ICON.files} <span>hub-pod data</span></button>
      </div>
      <div class="sb-section">
        <div class="sb-label">Tip</div>
        <div style="padding:6px 18px;font-size:12px;color:var(--text-dim);line-height:1.5">
          Files are real LDP resources on your pod. Click a folder to browse;
          click a file to fetch it in a new tab.
        </div>
      </div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Files browses the LDP containers on your Solid pod.")) return;
  storage = await discoverStorage(ctx.auth.id).catch(() => null);
  if (!storage) {
    container.innerHTML = `<div class="content"><div class="page-pad"><h1>Files</h1><p class="lede">Couldn't find your pod root.</p></div></div>`;
    return;
  }
  currentDir = hubRoot(storage);

  container.innerHTML = `
    <div class="content" style="height:100%;display:flex;flex-direction:column">
      <div class="files-toolbar">
        <div class="breadcrumb" id="files-bc"></div>
        <div></div>
      </div>
      <div class="files-grid" id="files-grid"><div class="spinner"></div></div>
    </div>
  `;

  $$("[data-go]", $("aside.sidebar")).forEach(el => el.addEventListener("click", () => {
    if (el.dataset.go === "storage") currentDir = storage;
    else currentDir = hubRoot(storage);
    load();
  }));

  load();
}

async function load() {
  const grid = $("#files-grid");
  const bc = $("#files-bc");
  if (!grid || !bc) return;
  bc.innerHTML = breadcrumbHTML(currentDir);
  $$(".crumb", bc).forEach(el => el.addEventListener("click", () => {
    currentDir = el.dataset.url;
    load();
  }));
  renderSpinner(grid);

  let items = [];
  try { items = await listContainer(currentDir); }
  catch (e) {
    renderEmpty(grid, { title: "Couldn't list this container", body: e.message });
    return;
  }

  if (!items.length) {
    renderEmpty(grid, { title: "Empty container", body: currentDir });
    return;
  }

  grid.innerHTML = "";
  items.forEach(it => {
    const slot = document.createElement("div");
    grid.appendChild(slot);
    const onOpen = (url, type) => {
      if (type === "container") { currentDir = url; load(); }
      else window.open(url, "_blank");
    };
    const ldpClass = it.type === "container"
      ? "http://www.w3.org/ns/ldp#Container"
      : "http://www.w3.org/ns/ldp#Resource";
    const input = { url: it.url, doc: { type: it.type }, forClass: ldpClass, onOpen };
    const pane = findFor(input);
    if (pane) pane.render(input, slot);
    else slot.outerHTML = `<div class="file-card other"><div class="fi">${ICON.doc}</div><div class="fn">${escape(it.url)}</div></div>`;
  });
}

function breadcrumbHTML(url) {
  // Parse the URL into segments under the storage root
  if (!storage || !url) return "";
  let rel = url.startsWith(storage) ? url.slice(storage.length) : url;
  rel = rel.replace(/\/$/, "");
  const parts = rel ? rel.split("/") : [];
  let acc = storage;
  let html = `<span class="crumb ${parts.length === 0 ? "cur" : ""}" data-url="${escape(storage)}">/</span>`;
  parts.forEach((p, i) => {
    acc += p + "/";
    html += `<span class="sep">/</span><span class="crumb ${i === parts.length - 1 ? "cur" : ""}" data-url="${escape(acc)}">${escape(decodeURIComponent(p))}</span>`;
  });
  return html;
}

function loginPrompt() {
  return `<div class="content"><div class="page-pad">
    <div class="login-banner">
      <div class="ico">${ICON.files}</div>
      <div class="info"><strong>Sign in to your pod</strong><span>Files browses real LDP containers on your pod.</span></div>
    </div>
  </div></div>`;
}

export const meta = { id: "files", name: "Files", icon: ICON.files, hasSidebar: true };
