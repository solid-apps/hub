/**
 * pad.js — markdown scratchpad. A minimal demo of the hub-pod app
 * interface: just `meta` + `render(container, ctx)`. Themes via hub's
 * CSS variables, persists to localStorage.
 */

export const meta = {
  id:         "demo-pad",
  name:       "Pad",
  icon:       "📝",
  hasSidebar: false,
};

const KEY = "demo-pad-content";

export async function render(container, ctx) {
  const who = ctx?.auth?.loggedIn
    ? (() => { try { return new URL(ctx.auth.id).hostname; } catch { return "you"; } })()
    : "you";
  const initial = localStorage.getItem(KEY) || "";
  container.innerHTML = `
    <div class="content"><div class="page-pad">
      <h1>Pad</h1>
      <p class="lede">A scratchpad for ${escapeHtml(who)}. Auto-saves to localStorage.</p>
      <textarea id="pad-area" placeholder="Start typing…" style="width:100%;min-height:60vh;background:var(--bg-elev);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:14px;font:14px/1.6 var(--mono);outline:none;resize:vertical"></textarea>
      <div id="pad-status" style="margin-top:8px;font:12px var(--mono);color:var(--text-faint)"></div>
    </div></div>`;
  const ta = container.querySelector("#pad-area");
  const st = container.querySelector("#pad-status");
  ta.value = initial;
  st.textContent = initial ? `${initial.length} chars · saved` : "empty";
  ta.addEventListener("input", () => {
    localStorage.setItem(KEY, ta.value);
    st.textContent = `${ta.value.length} chars · saved`;
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
