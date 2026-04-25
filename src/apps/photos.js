/**
 * Photos — gallery from a pod container.
 *
 * Lists images in <pod>/hub/photos/ (LDP container) and renders them
 * as a grid. Click to open full-size in a new tab.
 */

import { listContainer, hubRoot, discoverStorage, ensureContainer } from "../pod.js";
import { ICON, escape, renderSpinner, renderEmpty, $, $$, requireSolid } from "../ui.js";

export function sidebar(ctx) {
  return `
    <div class="sidebar-head"><h2>Photos</h2></div>
    <div class="sidebar-body">
      <div class="sb-section">
        <button class="sb-item active">${ICON.photos} <span>All photos</span><span class="count" id="ph-count">…</span></button>
      </div>
      <div class="sb-section">
        <div class="sb-label">Note</div>
        <div style="padding:6px 18px;font-size:12px;color:var(--text-dim);line-height:1.5">
          Drop image files into <code>/hub/photos/</code> on your pod (any tool that can PUT to a Solid container — Penny, Solid File Manager, etc.).
        </div>
      </div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Photos shows images from /hub/photos/ on your Solid pod.")) return;
  const storage = await discoverStorage(ctx.auth.id).catch(() => null);
  if (!storage) {
    container.innerHTML = `<div class="content"><div class="page-pad"><h1>Photos</h1><p class="lede">Couldn't find pod root.</p></div></div>`;
    return;
  }
  const dir = hubRoot(storage) + "photos/";
  await ensureContainer(dir).catch(() => {});

  container.innerHTML = `<div class="content"><div class="photos-grid" id="ph-grid"><div class="spinner"></div></div></div>`;
  const grid = $("#ph-grid");

  let images = [];
  try {
    const items = await listContainer(dir);
    images = items.filter(it => it.type === "resource" && /\.(png|jpe?g|gif|webp|svg)$/i.test(it.url));
  } catch (e) {
    renderEmpty(grid, { title: "Couldn't list photos", body: e.message });
    return;
  }

  $("#ph-count") && ($("#ph-count").textContent = images.length);

  if (!images.length) {
    renderEmpty(grid, {
      title: "No photos yet",
      body: `Drop images into ${dir}`,
    });
    return;
  }

  grid.innerHTML = images.map(it => {
    const name = decodeURIComponent(it.url.split("/").pop());
    return `
      <div class="photo" data-url="${escape(it.url)}">
        <img src="${escape(it.url)}" loading="lazy" alt="${escape(name)}" />
        <div class="fade">${escape(name)}</div>
      </div>
    `;
  }).join("");

  $$(".photo").forEach(el => el.addEventListener("click", () => {
    window.open(el.dataset.url, "_blank");
  }));
}

export const meta = { name: "Photos", icon: ICON.photos, hasSidebar: true };
