/**
 * file.js — pane for an LDP container/resource entry, rendered as a
 * file-card tile. Used by the Files app (and anywhere a directory
 * listing is shown).
 *
 * Input:
 *   { url, type: "container" | "resource", onOpen?: (url, type) => void }
 *
 * Click on a container fires onOpen — Files uses it to navigate.
 * Click on a resource opens the URL in a new tab.
 */

import { ICON, escape } from "../ui.js";

export const meta = { id: "hub-pod/file", name: "File / folder card" };

export function canHandle(input) {
  return !!input?.url && (input.type === "container" || input.type === "resource");
}

export async function render(input, container, _ctx) {
  const { url, type, onOpen } = input;
  const isDir = type === "container";
  const name = decodeURIComponent(url.replace(/\/$/, "").split("/").pop() || url);
  const cls = isDir ? "dir" : extClass(name);
  const ico = isDir ? ICON.files : extIcon(name);

  container.className = `file-card ${cls}`;
  container.dataset.url = url;
  container.title = url;
  container.innerHTML = `
    <div class="fi">${ico}</div>
    <div class="fn">${escape(name)}</div>
    <div class="fs">${isDir ? "folder" : ""}</div>
  `;
  container.addEventListener("click", () => {
    if (onOpen) onOpen(url, type);
    else if (!isDir) window.open(url, "_blank");
  });
}

function extClass(name) {
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name)) return "img";
  if (/\.(mp3|ogg|wav|flac)$/i.test(name)) return "audio";
  if (/\.(jsonld|json|js|css|ttl|n3|xml|html?)$/i.test(name)) return "code";
  if (/\.(md|txt)$/i.test(name)) return "doc";
  return "other";
}
function extIcon(name) {
  const c = extClass(name);
  if (c === "img") return ICON.img;
  if (c === "code") return ICON.code;
  return ICON.doc;
}
