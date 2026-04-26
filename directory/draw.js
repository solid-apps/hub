/**
 * draw.js — canvas sketch pad. Mouse + touch drawing, color picker,
 * brush size, clear, save as PNG. No libraries.
 */

export const meta = {
  id:         "demo-draw",
  name:       "Drawing pad",
  icon:       "🖌",
  hasSidebar: false,
};

const COLORS = ["#1f2937", "#dc2626", "#ea580c", "#facc15", "#16a34a", "#2563eb", "#9333ea", "#ec4899", "#ffffff"];

export async function render(container, _ctx) {
  let color = "#1f2937";
  let size = 4;
  let drawing = false;
  let last = null;

  container.innerHTML = `
    <div class="content"><div class="page-pad">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <h1 style="margin:0">Drawing pad</h1>
        <div id="draw-swatches" style="display:flex;gap:6px;margin-left:12px"></div>
        <div style="display:flex;align-items:center;gap:8px;font:12px var(--mono);color:var(--text-dim)">
          <span>Size</span>
          <input type="range" id="draw-size" min="1" max="40" value="${size}" style="width:120px" />
          <span id="draw-size-label">${size}px</span>
        </div>
        <button class="btn" id="draw-clear" style="margin-left:auto">Clear</button>
        <button class="btn primary" id="draw-save">Save PNG</button>
      </div>
      <div style="background:var(--bg-elev);border:1px solid var(--line);border-radius:10px;overflow:hidden;display:inline-block;max-width:100%">
        <canvas id="draw-canvas" width="900" height="560" style="display:block;cursor:crosshair;background:#fafafa;touch-action:none;max-width:100%;height:auto"></canvas>
      </div>
      <div style="margin-top:10px;color:var(--text-faint);font:12px var(--mono)">Strokes are session-only — Save PNG to keep your work.</div>
    </div></div>
  `;

  const sw = container.querySelector("#draw-swatches");
  for (const c of COLORS) {
    const s = document.createElement("button");
    s.dataset.color = c;
    s.style.cssText = `width:24px;height:24px;border-radius:50%;border:2px solid ${c === "#ffffff" ? "var(--line)" : "transparent"};cursor:pointer;background:${c};padding:0;transition:transform .1s,box-shadow .1s`;
    s.addEventListener("click", () => {
      color = c;
      sw.querySelectorAll("button").forEach(b => b.style.boxShadow = "");
      s.style.boxShadow = "0 0 0 3px var(--accent-soft)";
    });
    sw.appendChild(s);
    if (c === color) s.style.boxShadow = "0 0 0 3px var(--accent-soft)";
  }

  const canvas = container.querySelector("#draw-canvas");
  const ctxC = canvas.getContext("2d");
  ctxC.lineCap = "round";
  ctxC.lineJoin = "round";

  const sizeInp = container.querySelector("#draw-size");
  const sizeLbl = container.querySelector("#draw-size-label");
  sizeInp.addEventListener("input", () => {
    size = parseInt(sizeInp.value, 10);
    sizeLbl.textContent = size + "px";
  });

  container.querySelector("#draw-clear").addEventListener("click", () => {
    if (!confirm("Clear the canvas?")) return;
    ctxC.clearRect(0, 0, canvas.width, canvas.height);
  });
  container.querySelector("#draw-save").addEventListener("click", () => {
    // Draw to an offscreen canvas with white background, since Save PNG of
    // a transparent canvas reads weirdly.
    const off = document.createElement("canvas");
    off.width = canvas.width; off.height = canvas.height;
    const o = off.getContext("2d");
    o.fillStyle = "#ffffff"; o.fillRect(0, 0, off.width, off.height);
    o.drawImage(canvas, 0, 0);
    const a = document.createElement("a");
    a.href = off.toDataURL("image/png");
    a.download = `sketch-${Date.now()}.png`;
    a.click();
  });

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return {
      x: (t.clientX - r.left) * (canvas.width / r.width),
      y: (t.clientY - r.top)  * (canvas.height / r.height),
    };
  }
  function down(e) {
    e.preventDefault();
    drawing = true;
    last = pos(e);
    // Dot for single click
    ctxC.beginPath();
    ctxC.arc(last.x, last.y, size / 2, 0, Math.PI * 2);
    ctxC.fillStyle = color;
    ctxC.fill();
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctxC.beginPath();
    ctxC.moveTo(last.x, last.y);
    ctxC.lineTo(p.x, p.y);
    ctxC.strokeStyle = color;
    ctxC.lineWidth = size;
    ctxC.stroke();
    last = p;
  }
  function up() { drawing = false; last = null; }

  canvas.addEventListener("mousedown",  down);
  canvas.addEventListener("mousemove",  move);
  window.addEventListener("mouseup",    up);
  canvas.addEventListener("touchstart", down, { passive: false });
  canvas.addEventListener("touchmove",  move, { passive: false });
  window.addEventListener("touchend",   up);

  // Cleanup on detach
  const observer = new MutationObserver(() => {
    if (!container.isConnected) {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
      observer.disconnect();
    }
  });
  if (container.parentNode) observer.observe(container.parentNode, { childList: true });
}
