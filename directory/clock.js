/**
 * clock.js — multi-zone live clocks. Demonstrates a permanent ticking
 * UI in a hub app. Persists chosen zones to localStorage.
 */

export const meta = {
  id:         "demo-clock",
  name:       "Clock",
  icon:       "🕒",
  hasSidebar: false,
};

const KEY = "demo-clock-zones";
const DEFAULTS = ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];

export async function render(container, ctx) {
  let zones = readZones();
  let timer = null;

  container.innerHTML = `
    <div class="content"><div class="page-pad">
      <h1 style="margin:0 0 6px">Clock</h1>
      <p class="lede">Live time across zones. Click a clock to remove; add new zones below.</p>
      <div id="clock-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin:18px 0"></div>
      <div style="display:flex;gap:8px;align-items:center">
        <input id="clock-input" placeholder="Europe/Paris" list="clock-zones" style="flex:1;background:var(--bg-elev);border:1px solid var(--line);border-radius:8px;padding:8px 12px;font:13px var(--mono);color:var(--text);outline:none" />
        <button class="btn primary" id="clock-add">Add</button>
      </div>
      <datalist id="clock-zones"></datalist>
      <div style="margin-top:8px;font:12px var(--mono);color:var(--text-faint)">Use any IANA timezone name (e.g. Pacific/Auckland, Africa/Lagos).</div>
    </div></div>`;

  const grid = container.querySelector("#clock-grid");
  const input = container.querySelector("#clock-input");
  const datalist = container.querySelector("#clock-zones");

  // Populate datalist with common zones
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      datalist.innerHTML = Intl.supportedValuesOf("timeZone").map(z => `<option value="${z}"></option>`).join("");
    } catch { /* ignore */ }
  }

  draw();
  timer = setInterval(draw, 1000);

  // Stop the interval when the container is detached. Hub re-renders apps
  // on rail switch by replacing #main innerHTML — we detect detachment
  // via MutationObserver and clear the timer.
  const stopWhenDetached = new MutationObserver(() => {
    if (!container.isConnected) {
      clearInterval(timer);
      stopWhenDetached.disconnect();
    }
  });
  if (container.parentNode) stopWhenDetached.observe(container.parentNode, { childList: true });

  container.querySelector("#clock-add").addEventListener("click", () => addZone());
  input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addZone(); } });

  function addZone() {
    const z = input.value.trim();
    if (!z) return;
    try { new Intl.DateTimeFormat("en", { timeZone: z }); }
    catch { return; }
    if (!zones.includes(z)) {
      zones.push(z);
      save();
    }
    input.value = "";
    draw();
  }

  function draw() {
    const now = new Date();
    grid.innerHTML = zones.map(z => {
      let timeStr = "—", dateStr = "";
      try {
        timeStr = now.toLocaleTimeString("en-GB", { timeZone: z, hour: "2-digit", minute: "2-digit", second: "2-digit" });
        dateStr = now.toLocaleDateString("en-GB", { timeZone: z, weekday: "short", day: "numeric", month: "short" });
      } catch { /* invalid zone */ }
      return `
        <div data-zone="${escapeHtml(z)}" style="background:var(--bg-elev);border:1px solid var(--line);border-radius:10px;padding:18px;cursor:pointer;transition:border-color .15s">
          <div style="font:600 13px var(--mono);color:var(--text-dim);margin-bottom:6px">${escapeHtml(z)}</div>
          <div style="font:600 28px/1 var(--mono);color:var(--text);letter-spacing:-0.02em">${timeStr}</div>
          <div style="font:12px var(--sans);color:var(--text-faint);margin-top:4px">${dateStr}</div>
        </div>
      `;
    }).join("");
    grid.querySelectorAll("[data-zone]").forEach(el => el.addEventListener("click", () => {
      const z = el.dataset.zone;
      zones = zones.filter(x => x !== z);
      save(); draw();
    }));
  }

  function save() { localStorage.setItem(KEY, JSON.stringify(zones)); }
}

function readZones() {
  try {
    const v = JSON.parse(localStorage.getItem("demo-clock-zones") || "null");
    return Array.isArray(v) && v.length ? v : DEFAULTS.slice();
  } catch { return DEFAULTS.slice(); }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
