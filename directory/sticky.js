/**
 * sticky.js — colourful draggable sticky notes. Persists to
 * localStorage. Demonstrates that hub apps can do more than render
 * forms — full interactive surfaces work too.
 */

export const meta = {
  id:         "demo-sticky",
  name:       "Sticky",
  icon:       "📌",
  hasSidebar: false,
};

const KEY = "demo-sticky-notes";
const COLOURS = ["#fef08a", "#bef264", "#86efac", "#7dd3fc", "#c4b5fd", "#f9a8d4", "#fdba74"];

export async function render(container, ctx) {
  let notes = readNotes();

  container.innerHTML = `
    <div class="content"><div class="page-pad">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <h1 style="margin:0">Sticky</h1>
        <button class="btn primary" id="sticky-add">+ New note</button>
        <span style="margin-left:auto;font:12px var(--mono);color:var(--text-faint)" id="sticky-count"></span>
      </div>
      <div id="sticky-board" style="position:relative;min-height:60vh;background:var(--bg-elev);border:1px solid var(--line);border-radius:10px;overflow:hidden"></div>
    </div></div>`;

  const board = container.querySelector("#sticky-board");
  const count = container.querySelector("#sticky-count");

  draw();

  container.querySelector("#sticky-add").addEventListener("click", () => {
    const colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    notes.push({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      x: 24 + Math.random() * 200,
      y: 24 + Math.random() * 100,
      text: "",
      colour,
    });
    save(); draw();
  });

  function draw() {
    board.innerHTML = "";
    count.textContent = notes.length === 0 ? "no notes yet" : `${notes.length} note${notes.length === 1 ? "" : "s"}`;
    for (const n of notes) {
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;left:${n.x}px;top:${n.y}px;width:200px;min-height:140px;background:${n.colour};border-radius:6px;padding:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);cursor:move;transform:rotate(${(Math.random() - 0.5) * 2}deg);transition:transform .15s,box-shadow .15s`;
      el.innerHTML = `
        <textarea data-id="${n.id}" style="width:100%;height:96px;background:transparent;border:none;outline:none;resize:none;font:14px/1.4 var(--sans);color:#1f2937">${escapeHtml(n.text)}</textarea>
        <button data-del="${n.id}" style="position:absolute;top:4px;right:4px;background:transparent;border:none;cursor:pointer;color:#1f2937;opacity:.4;font-size:16px;line-height:1">×</button>
      `;
      el.addEventListener("mousedown", e => {
        if (e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON") return;
        const startX = e.clientX - n.x;
        const startY = e.clientY - n.y;
        const onMove = (ev) => { n.x = ev.clientX - startX; n.y = ev.clientY - startY; el.style.left = n.x + "px"; el.style.top = n.y + "px"; };
        const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); save(); };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      });
      el.querySelector("textarea").addEventListener("input", e => { n.text = e.target.value; save(); });
      el.querySelector("[data-del]").addEventListener("click", () => { notes = notes.filter(x => x.id !== n.id); save(); draw(); });
      board.appendChild(el);
    }
  }

  function save() { localStorage.setItem(KEY, JSON.stringify(notes)); }
}

function readNotes() {
  try { return JSON.parse(localStorage.getItem("demo-sticky-notes") || "[]"); }
  catch { return []; }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
