/**
 * collection.js — generic list-of-subjects pane.
 *
 * Takes an array of items (each `{url, doc?, forClass?, view?}`) and
 * renders each into its own slot using whichever per-item pane the
 * host's registry returns. The collection pane itself draws no leaf
 * data — it's pure orchestration over child panes.
 *
 * Input (rawData):
 *   {
 *     items:    Array<{url, doc?, forClass?, view?}>,
 *     layout?:  "grid" | "list"          // default "grid"
 *     empty?:   { title?, body? }        // shown when items.length === 0
 *     onSelect?: (item) => void          // optional click forwarding
 *   }
 *
 * Hosts invoke explicitly: `pane.render({items}, container, ctx)`.
 * Per-slot rendering uses `ctx.resolvePane(input)` so urn:solid:view,
 * user pins, and registration order all flow through identically to
 * single-subject rendering. If any slot's pane lookup fails, that
 * slot gets a placeholder with the URL — the rest still render.
 */

import { ICON, escape } from "../ui.js";

export const label = "Collection";
export const icon  = "🗂";
export const meta = {
  id: "hub-pod/collection",
  name: "Generic collection (grid/list)",
};

export function canHandle(_subject, _store, rawData) {
  return Array.isArray(rawData?.items);
}

export async function render(_subject, _store, container, rawData, ctx) {
  const items   = rawData?.items || [];
  const layout  = rawData?.layout || "grid";
  const empty   = rawData?.empty;
  const onSelect = rawData?.onSelect;

  injectStyles();

  if (!items.length) {
    container.innerHTML = `<div class="coll-empty">
      <div class="coll-empty-title">${escape(empty?.title || "Nothing here yet")}</div>
      ${empty?.body ? `<div class="coll-empty-body">${escape(empty.body)}</div>` : ""}
    </div>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = `coll coll-${layout}`;
  container.appendChild(grid);

  // Resolve panes in parallel — most slots come from the same class so
  // they hit the registry cache. Failures fall back to a placeholder.
  await Promise.all(items.map(async (item) => {
    const slot = document.createElement("div");
    slot.className = "coll-slot";
    if (onSelect) {
      slot.style.cursor = "pointer";
      slot.addEventListener("click", () => onSelect(item));
    }
    grid.appendChild(slot);
    try {
      const pane = ctx?.resolvePane
        ? await ctx.resolvePane(item)
        : (ctx?.findPane ? ctx.findPane(item) : null);
      if (pane) {
        await pane.render(item, slot, ctx);
      } else {
        slot.innerHTML = `<div class="coll-fallback">
          <div class="coll-fallback-url">${escape(item.url || "(no url)")}</div>
          <div class="coll-fallback-hint">No pane registered${item.forClass ? ` for ${escape(item.forClass)}` : ""}.</div>
        </div>`;
      }
    } catch (e) {
      slot.innerHTML = `<div class="coll-fallback err">
        <div class="coll-fallback-url">${escape(item.url || "(no url)")}</div>
        <div class="coll-fallback-hint">Pane failed: ${escape(e.message)}</div>
      </div>`;
    }
  }));
}

function injectStyles() {
  if (document.getElementById("coll-pane-css")) return;
  const s = document.createElement("style");
  s.id = "coll-pane-css";
  s.textContent = `
.coll-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.coll-list { display: flex; flex-direction: column; gap: 6px; }
.coll-slot { min-width: 0; }
.coll-fallback { padding: 12px 14px; border: 1px dashed var(--line); border-radius: 8px; color: var(--text-dim); }
.coll-fallback.err { border-color: var(--danger); color: var(--danger); }
.coll-fallback-url { font-family: var(--mono); font-size: 12px; word-break: break-all; }
.coll-fallback-hint { font-size: 12px; color: var(--text-faint); margin-top: 4px; }
.coll-empty { padding: 32px 24px; text-align: center; color: var(--text-faint); }
.coll-empty-title { font-size: 15px; color: var(--text); margin-bottom: 4px; }
.coll-empty-body { font-size: 13px; }
`;
  document.head.appendChild(s);
}

export default { label, icon, canHandle, render };
