/**
 * calculator.js — basic 4-function calculator with keyboard input.
 */

export const meta = {
  id:         "demo-calculator",
  name:       "Calculator",
  icon:       "🧮",
  hasSidebar: false,
};

export async function render(container, _ctx) {
  let display = "0";
  let prev = null;
  let op = null;
  let resetOnNext = false;

  const KEYS = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  container.innerHTML = `
    <div class="content"><div class="page-pad" style="max-width:340px;margin:0 auto">
      <h1 style="margin:0 0 6px">Calculator</h1>
      <p class="lede" style="margin-bottom:16px">Keyboard works too: 0–9, + − * / Enter Esc.</p>
      <div id="calc-disp" style="background:var(--bg-elev);border:1px solid var(--line);border-radius:12px;padding:18px 20px;font:600 36px/1 var(--mono);color:var(--text);text-align:right;letter-spacing:-0.02em;margin-bottom:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">0</div>
      <div id="calc-pad" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"></div>
    </div></div>
  `;

  const dispEl = container.querySelector("#calc-disp");
  const pad = container.querySelector("#calc-pad");

  for (const row of KEYS) {
    for (const k of row) {
      const b = document.createElement("button");
      b.textContent = k;
      b.dataset.key = k;
      const isOp = "÷×−+=".includes(k);
      const isCtl = "C±%".includes(k);
      b.style.cssText = `
        height:56px;border:1px solid var(--line);border-radius:10px;
        font:600 18px var(--sans);cursor:pointer;
        background:${isOp ? "var(--accent)" : isCtl ? "var(--bg-elev-2)" : "var(--bg-elev)"};
        color:${isOp ? "var(--text-on-accent,#fff)" : "var(--text)"};
        transition:transform .08s, filter .12s;
      `;
      if (k === "0") b.style.gridColumn = "span 2";
      b.addEventListener("mousedown", () => { b.style.transform = "scale(0.96)"; });
      b.addEventListener("mouseup", () => { b.style.transform = ""; });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
      b.addEventListener("click", () => press(k));
      pad.appendChild(b);
    }
  }

  document.addEventListener("keydown", onKey);
  // Stop listening when detached
  const observer = new MutationObserver(() => {
    if (!container.isConnected) { document.removeEventListener("keydown", onKey); observer.disconnect(); }
  });
  if (container.parentNode) observer.observe(container.parentNode, { childList: true });

  draw();

  function onKey(e) {
    if (!container.isConnected) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    const map = { "*": "×", "/": "÷", "-": "−", "Enter": "=", "Escape": "C", "Backspace": "⌫" };
    const k = map[e.key] || e.key;
    if ("0123456789.".includes(k) || "÷×−+=C".includes(k)) {
      e.preventDefault();
      press(k);
    } else if (k === "⌫") {
      display = display.length > 1 ? display.slice(0, -1) : "0";
      draw();
    }
  }

  function press(k) {
    if (k === "C")      { display = "0"; prev = null; op = null; }
    else if (k === "±") { display = display.startsWith("-") ? display.slice(1) : (display === "0" ? "0" : "-" + display); }
    else if (k === "%") { display = String(parseFloat(display) / 100); }
    else if ("÷×−+".includes(k)) {
      if (op && !resetOnNext) compute();
      prev = parseFloat(display);
      op = k;
      resetOnNext = true;
    }
    else if (k === "=") { compute(); op = null; prev = null; resetOnNext = true; }
    else if (k === ".") {
      if (resetOnNext) { display = "0."; resetOnNext = false; }
      else if (!display.includes(".")) display += ".";
    }
    else { // digit
      if (resetOnNext || display === "0") { display = k; resetOnNext = false; }
      else display += k;
    }
    draw();
  }
  function compute() {
    if (prev == null || !op) return;
    const cur = parseFloat(display);
    let r = 0;
    if (op === "+") r = prev + cur;
    if (op === "−") r = prev - cur;
    if (op === "×") r = prev * cur;
    if (op === "÷") r = cur === 0 ? NaN : prev / cur;
    display = Number.isFinite(r) ? trim(r) : "Err";
  }
  function trim(n) {
    return parseFloat(n.toPrecision(12)).toString();
  }
  function draw() { dispEl.textContent = display; }
}
