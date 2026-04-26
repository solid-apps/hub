/**
 * pomodoro.js — work/break timer.
 *
 * 25/5 by default. Start, Pause, Reset. Audio cue at zero. Settings
 * persist to localStorage. Auto-cycles work → break → work …
 */

export const meta = {
  id:         "demo-pomodoro",
  name:       "Pomodoro",
  icon:       "⏲",
  hasSidebar: false,
};

const KEY = "demo-pomodoro";

export async function render(container, _ctx) {
  let { workMin, breakMin } = readSettings();
  let mode = "work";          // "work" | "break"
  let remaining = workMin * 60;
  let running = false;
  let timer = null;
  let cyclesDone = 0;

  container.innerHTML = `
    <div class="content"><div class="page-pad" style="text-align:center">
      <h1 style="margin:0 0 6px">Pomodoro</h1>
      <p class="lede">Focus in 25-minute bursts. Break in 5.</p>
      <div id="pom-mode" style="font:600 13px var(--mono);color:var(--text-dim);margin:18px 0 6px;text-transform:uppercase;letter-spacing:0.1em"></div>
      <div id="pom-time" style="font:700 96px/1 var(--mono);color:var(--text);letter-spacing:-0.04em;margin:6px 0 18px"></div>
      <div id="pom-cycles" style="font:12px var(--mono);color:var(--text-faint);margin-bottom:18px"></div>
      <div style="display:flex;justify-content:center;gap:10px;margin-bottom:24px">
        <button class="btn primary" id="pom-toggle" style="min-width:96px">Start</button>
        <button class="btn" id="pom-reset" style="min-width:96px">Reset</button>
      </div>
      <div style="max-width:380px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;font-size:13px;color:var(--text-dim)">
        <label>Work (min)</label>
        <input type="number" id="pom-work" min="1" max="120" value="${workMin}" style="width:64px;background:var(--bg-elev);border:1px solid var(--line);border-radius:6px;padding:4px 8px;font:13px var(--mono);color:var(--text);outline:none" />
        <label>Break (min)</label>
        <input type="number" id="pom-break" min="1" max="60" value="${breakMin}" style="width:64px;background:var(--bg-elev);border:1px solid var(--line);border-radius:6px;padding:4px 8px;font:13px var(--mono);color:var(--text);outline:none" />
      </div>
    </div></div>
  `;

  const modeEl = container.querySelector("#pom-mode");
  const timeEl = container.querySelector("#pom-time");
  const cyclesEl = container.querySelector("#pom-cycles");
  const toggleBtn = container.querySelector("#pom-toggle");
  const resetBtn  = container.querySelector("#pom-reset");
  const workInp   = container.querySelector("#pom-work");
  const breakInp  = container.querySelector("#pom-break");

  draw();

  toggleBtn.addEventListener("click", () => running ? pause() : start());
  resetBtn.addEventListener("click", reset);
  workInp.addEventListener("change", () => {
    workMin = Math.max(1, Math.min(120, parseInt(workInp.value, 10) || 25));
    saveSettings();
    if (mode === "work" && !running) { remaining = workMin * 60; draw(); }
  });
  breakInp.addEventListener("change", () => {
    breakMin = Math.max(1, Math.min(60, parseInt(breakInp.value, 10) || 5));
    saveSettings();
    if (mode === "break" && !running) { remaining = breakMin * 60; draw(); }
  });

  // Stop timer when container detached (rail switch)
  const observer = new MutationObserver(() => {
    if (!container.isConnected) { clearInterval(timer); observer.disconnect(); }
  });
  if (container.parentNode) observer.observe(container.parentNode, { childList: true });

  function start() {
    if (running) return;
    running = true;
    timer = setInterval(tick, 1000);
    toggleBtn.textContent = "Pause";
  }
  function pause() {
    running = false;
    clearInterval(timer);
    toggleBtn.textContent = "Resume";
  }
  function reset() {
    pause();
    remaining = (mode === "work" ? workMin : breakMin) * 60;
    toggleBtn.textContent = "Start";
    draw();
  }
  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      beep();
      cyclesDone += mode === "work" ? 1 : 0;
      mode = mode === "work" ? "break" : "work";
      remaining = (mode === "work" ? workMin : breakMin) * 60;
    }
    draw();
  }
  function draw() {
    const m = Math.floor(remaining / 60).toString().padStart(2, "0");
    const s = (remaining % 60).toString().padStart(2, "0");
    timeEl.textContent = `${m}:${s}`;
    modeEl.textContent = mode === "work" ? "Focus" : "Break";
    modeEl.style.color = mode === "work" ? "var(--accent)" : "var(--good)";
    cyclesEl.textContent = `${cyclesDone} pomodoro${cyclesDone === 1 ? "" : "s"} completed`;
  }
  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = mode === "work" ? 880 : 440; // higher pitch when starting work
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch { /* audio context blocked */ }
  }
  function saveSettings() { localStorage.setItem(KEY, JSON.stringify({ workMin, breakMin })); }
}

function readSettings() {
  try {
    const v = JSON.parse(localStorage.getItem("demo-pomodoro") || "null");
    return {
      workMin: Number.isFinite(v?.workMin) ? v.workMin : 25,
      breakMin: Number.isFinite(v?.breakMin) ? v.breakMin : 5,
    };
  } catch { return { workMin: 25, breakMin: 5 }; }
}
