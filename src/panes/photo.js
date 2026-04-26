/**
 * photo.js — pane for one image (photo tile).
 *
 * Input shape:
 *   { src, title?, alt? }
 *
 * Renders the standard hub-pod .photo tile with hover overlay; click
 * opens the image in a new tab.
 */

import { escape } from "../ui.js";

export const meta = { id: "hub-pod/photo", name: "Photo tile" };

export function canHandle(input) {
  return !!input?.src && /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(input.src);
}

export async function render(input, container, _ctx) {
  const { src, title, alt } = input;
  container.className = "photo";
  container.dataset.src = src;
  container.innerHTML = `
    <img src="${escape(src)}" loading="lazy" alt="${escape(alt || title || "")}" />
    ${title ? `<div class="fade">${escape(title)}</div>` : ""}
  `;
  container.addEventListener("click", () => window.open(src, "_blank"));
}
