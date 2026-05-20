var bi=Object.create;var tn=Object.defineProperty;var wi=Object.getOwnPropertyDescriptor;var ki=Object.getOwnPropertyNames;var _i=Object.getPrototypeOf,$i=Object.prototype.hasOwnProperty;var S=(e,t)=>()=>(e&&(t=e(e=0)),t);var va=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),N=(e,t)=>{for(var n in t)tn(e,n,{get:t[n],enumerable:!0})},Ci=(e,t,n,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of ki(t))!$i.call(e,o)&&o!==n&&tn(e,o,{get:()=>t[o],enumerable:!(a=wi(t,o))||a.enumerable});return e};var Li=(e,t,n)=>(n=e!=null?bi(_i(e)):{},Ci(t||!e||!e.__esModule?tn(n,"default",{value:e,enumerable:!0}):n,e));var ga,ma=S(()=>{ga=`:root {
  --bg: #0b0d12;
  --bg-elev: #11141b;
  --bg-elev-2: #161a23;
  --bg-elev-3: #1c2230;
  --line: #232836;
  --line-2: #2c3344;
  --text: #e7ecf4;
  --text-dim: #9aa4b8;
  --text-faint: #5d6680;
  --accent: #7c5cff;
  --accent-2: #00d4ff;
  --accent-soft: rgba(124, 92, 255, .15);
  --good: #34d399;
  --warn: #fbbf24;
  --danger: #f87171;
  --pink: #ff6ec7;
  --shadow: 0 20px 50px -20px rgba(0,0,0,.6), 0 8px 16px -8px rgba(0,0,0,.4);
  --radius: 14px;
  --radius-sm: 8px;
  --mono: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace;
  --sans: ui-sans-serif, system-ui, -apple-system, "Inter", "Segoe UI", Roboto, sans-serif;
  --easing: cubic-bezier(.2,.8,.2,1);
}
[data-theme="light"] {
  --bg: #f6f7fb;
  --bg-elev: #ffffff;
  --bg-elev-2: #f0f2f8;
  --bg-elev-3: #e8ecf4;
  --line: #e3e6ef;
  --line-2: #d3d7e2;
  --text: #1a1f2e;
  --text-dim: #5a6275;
  --text-faint: #98a0b3;
  --accent: #6b46e5;
  --accent-2: #0099cc;
  --accent-soft: rgba(107, 70, 229, .1);
  --shadow: 0 10px 30px -12px rgba(20,30,60,.18), 0 4px 8px -4px rgba(20,30,60,.06);
}
* { box-sizing: border-box; }
/* Sensible default: any SVG inside a heading defaults to icon-size,
 * so a stray \${ICON.x} in a <h2>/<h3> doesn't expand to fill its
 * container. Per-context rules with higher specificity still win. */
h1 svg, h2 svg, h3 svg, h4 svg { width: 14px; height: 14px; flex-shrink: 0; }
html, body { height: 100%; margin: 0; }
body {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--text);
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
body::before {
  content: ""; position: fixed; inset: 0;
  background:
    radial-gradient(900px 500px at 0% 0%, rgba(124,92,255,.18), transparent 60%),
    radial-gradient(700px 400px at 100% 100%, rgba(0,212,255,.14), transparent 60%);
  pointer-events: none; z-index: 0;
}
[data-theme="light"] body::before {
  background: radial-gradient(900px 500px at 0% 0%, rgba(107,70,229,.07), transparent 60%);
}

/* SHELL */
.shell {
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: 64px 240px 1fr;
  grid-template-rows: 52px 1fr;
  height: 100vh;
}

/* TOPBAR */
.topbar {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  border-bottom: 1px solid var(--line);
  background: var(--bg-elev);
  padding: 0 16px 0 0;
  z-index: 10;
}
.brand { display: flex; align-items: center; justify-content: center; }
.brand-mark {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border-radius: 9px;
  box-shadow: 0 4px 14px rgba(124,92,255,.4);
  text-decoration: none;
}
.brand-mark svg { width: 18px; height: 18px; }
.topbar-app-title {
  display: flex; align-items: center; gap: 12px;
  font-weight: 600; letter-spacing: -.01em; font-size: 15px;
}
.topbar-app-title .crumb { color: var(--text-faint); font-weight: 400; }
.topbar-actions { display: flex; align-items: center; gap: 6px; }

.search-trigger {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--line);
  border-radius: 100px;
  cursor: pointer;
  color: var(--text-faint);
  font-family: inherit; font-size: 13px;
  min-width: 280px;
  transition: all .15s var(--easing);
}
.search-trigger:hover { border-color: var(--accent); color: var(--text-dim); }
.search-trigger svg { width: 14px; height: 14px; }
.search-trigger .spacer { flex: 1; }
.kbd {
  font-family: var(--mono); font-size: 11px;
  padding: 2px 6px;
  background: var(--bg-elev-3);
  border: 1px solid var(--line);
  border-radius: 5px;
  color: var(--text-faint);
}

.icon-btn {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  background: transparent; border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-dim);
  cursor: pointer;
  transition: all .15s var(--easing);
  position: relative;
  font-family: inherit;
}
.icon-btn:hover {
  background: var(--bg-elev-2);
  color: var(--text);
  border-color: var(--line);
}
.icon-btn svg { width: 16px; height: 16px; }

/* AUTH PILL */
.auth-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 11px 5px 6px;
  background: var(--bg-elev-2);
  border: 1px solid var(--line);
  border-radius: 100px;
  font-size: 13px;
  margin-left: 4px;
  cursor: pointer;
}
.auth-pill:hover { border-color: var(--accent); }
.auth-pill .ava {
  width: 24px; height: 24px;
  border-radius: 50%;
  display: grid; place-items: center;
  color: white; font-weight: 600; font-size: 11px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
}
.auth-pill .name { color: var(--text); font-weight: 500; }
.auth-pill .label { color: var(--text-faint); font-size: 11px; }

/* APP RAIL */
.rail {
  border-right: 1px solid var(--line);
  background: var(--bg-elev);
  padding: 10px 0;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  overflow-y: auto;
}
.rail::-webkit-scrollbar { display: none; }
.rail-item {
  width: 44px; height: 44px;
  display: grid; place-items: center;
  background: transparent; border: none;
  border-radius: 11px;
  color: var(--text-dim);
  cursor: pointer;
  position: relative;
  transition: all .15s var(--easing);
  font-family: inherit;
}
.rail-item:hover { background: var(--bg-elev-2); color: var(--text); }
.rail-item.active {
  color: white;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow: 0 6px 16px rgba(124,92,255,.4);
}
.rail-item svg { width: 18px; height: 18px; }
.rail-tip {
  position: absolute; left: calc(100% + 8px); top: 50%;
  transform: translateY(-50%);
  background: var(--bg-elev-3);
  color: var(--text);
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0; pointer-events: none;
  transition: opacity .15s var(--easing);
  z-index: 50;
  border: 1px solid var(--line);
}
.rail-item:hover .rail-tip { opacity: 1; }
.rail-divider { width: 24px; height: 1px; background: var(--line); margin: 4px 0; }

/* SIDEBAR */
.sidebar {
  border-right: 1px solid var(--line);
  background: var(--bg-elev);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.sidebar-head {
  padding: 16px 18px 12px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--line);
}
.sidebar-head h2 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.sidebar-body { flex: 1; overflow-y: auto; padding: 8px 0; }
.sb-section { padding: 8px 0; }
.sb-section + .sb-section { border-top: 1px solid var(--line); margin-top: 4px; }
.sb-label {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--text-faint);
  padding: 6px 18px;
}
.sb-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 18px;
  background: transparent; border: none; text-align: left;
  color: var(--text-dim);
  cursor: pointer; font-family: inherit; font-size: 14px;
  position: relative;
  transition: all .12s var(--easing);
  width: 100%;
}
.sb-item:hover { background: var(--bg-elev-2); color: var(--text); }
.sb-item.active {
  background: var(--accent-soft);
  color: var(--text);
  font-weight: 500;
}
.sb-item.active::before {
  content: ""; position: absolute; left: 0; top: 6px; bottom: 6px;
  width: 3px; background: var(--accent); border-radius: 0 3px 3px 0;
}
.sb-item svg { width: 14px; height: 14px; flex-shrink: 0; }
.sb-item .count { margin-left: auto; font-family: var(--mono); font-size: 11px; color: var(--text-faint); }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--text);
  font-family: inherit; font-weight: 500; font-size: 13px;
  cursor: pointer;
  transition: all .15s var(--easing);
  text-decoration: none;
}
.btn:hover { border-color: var(--accent); }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: white; border-color: transparent;
  box-shadow: 0 4px 12px rgba(124,92,255,.35);
}
.btn.primary:hover { transform: translateY(-1px); }
.btn.danger { background: rgba(239,68,68,.1); color: var(--danger); border-color: rgba(239,68,68,.3); }
.btn svg { width: 12px; height: 12px; }

/* MAIN */
.main {
  overflow-y: auto;
  position: relative;
  display: flex; flex-direction: column;
}
.main-no-sidebar { grid-column: 2 / -1; }
.content {
  flex: 1; min-height: 0;
  animation: fadeUp .3s var(--easing);
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

.page-pad { padding: 28px 32px; max-width: 1100px; margin: 0 auto; width: 100%; }
.page-pad h1 { margin: 0 0 4px; font-size: 28px; font-weight: 700; letter-spacing: -.02em; }
.page-pad .lede { color: var(--text-dim); margin: 0 0 24px; }

/* CARDS */
.card {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px 22px;
  margin-bottom: 16px;
  box-shadow: var(--shadow);
}
.card h2 {
  margin: 0 0 14px;
  font-size: 13px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-faint);
  display: flex; align-items: center; gap: 8px;
}
.card h2 svg { width: 13px; height: 13px; flex-shrink: 0; }
.card h2 .more {
  margin-left: auto;
  color: var(--accent);
  font-weight: 500; text-transform: none; letter-spacing: 0;
  font-size: 12px;
  cursor: pointer; text-decoration: none;
}

/* LOGIN BANNER */
.login-banner {
  margin: 16px 0;
  padding: 18px 22px;
  background: var(--accent-soft);
  border: 1px solid rgba(124,92,255,.3);
  border-radius: var(--radius);
  display: flex; align-items: center; gap: 16px;
}
.login-banner .ico {
  width: 40px; height: 40px; flex-shrink: 0;
  border-radius: 50%;
  display: grid; place-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: white;
}
.login-banner .ico svg { width: 18px; height: 18px; }
.login-banner .info { flex: 1; }
.login-banner .info strong { display: block; font-size: 15px; }
.login-banner .info span { color: var(--text-dim); font-size: 13px; }

/* WIDGETS GRID (Home) */
.widgets {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.widget {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px 20px;
  box-shadow: var(--shadow);
}
.w-4 { grid-column: span 4; }
.w-6 { grid-column: span 6; }
.w-8 { grid-column: span 8; }
.w-12 { grid-column: span 12; }
.widget h3 {
  margin: 0 0 14px;
  font-size: 13px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-faint);
  display: flex; align-items: center; gap: 8px;
}
.widget h3 .more {
  margin-left: auto;
  color: var(--accent);
  font-weight: 500; text-transform: none; letter-spacing: 0;
  font-size: 12px;
  cursor: pointer; text-decoration: none;
}
.widget h3 svg { width: 13px; height: 13px; }

/* AVATAR */
.ava {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: grid; place-items: center;
  color: white; font-weight: 600; font-size: 15px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  flex-shrink: 0;
  overflow: hidden;
}
.ava img { width: 100%; height: 100%; object-fit: cover; }
.ava.lg { width: 96px; height: 96px; font-size: 32px; }
.ava.sm { width: 28px; height: 28px; font-size: 11px; }
.ava.xs { width: 22px; height: 22px; font-size: 9px; }

/* PROFILE */
.profile-hero {
  display: flex; gap: 24px; align-items: flex-start;
}
.profile-hero .info { flex: 1; min-width: 0; }
.profile-hero h1 { font-size: 28px; margin: 0 0 4px; }
.profile-hero .webid {
  color: var(--text-faint); font-family: var(--mono); font-size: 12px;
  word-break: break-all;
}
.profile-fields { display: flex; flex-direction: column; gap: 4px; margin-top: 14px; }
.profile-field {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 14px; align-items: center;
  padding: 10px 12px;
  border-radius: 9px;
  cursor: pointer;
  transition: background .12s var(--easing);
}
.profile-field:hover { background: var(--bg-elev-2); }
.profile-field .lbl {
  font-size: 12px; text-transform: uppercase;
  letter-spacing: .06em; color: var(--text-faint); font-weight: 600;
}
.profile-field .val { font-size: 14px; font-family: var(--mono); }
.profile-field .val.empty { color: var(--text-faint); font-style: italic; }
.profile-field input {
  background: var(--bg-elev-2);
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono); font-size: 14px;
  outline: none;
  width: 100%;
}

/* FILES */
.files-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid var(--line);
}
.breadcrumb { display: flex; align-items: center; gap: 4px; font-family: var(--mono); font-size: 13px; flex-wrap: wrap; }
.breadcrumb .crumb { color: var(--text-dim); cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.breadcrumb .crumb:hover { background: var(--bg-elev-2); color: var(--text); }
.breadcrumb .crumb.cur { color: var(--text); font-weight: 500; }
.breadcrumb .sep { color: var(--text-faint); }
.files-grid {
  padding: 18px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}
.file-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 18px 12px;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all .15s var(--easing);
}
.file-card:hover { background: var(--bg-elev-2); transform: translateY(-2px); }
.file-card .fi {
  width: 50px; height: 50px;
  display: grid; place-items: center;
  border-radius: 11px;
}
.file-card.dir .fi { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: white; }
.file-card.doc .fi { background: rgba(0,212,255,.15); color: var(--accent-2); }
.file-card.img .fi { background: rgba(52,211,153,.15); color: var(--good); }
.file-card.code .fi { background: rgba(251,191,36,.15); color: var(--warn); }
.file-card.audio .fi { background: rgba(255,110,199,.15); color: var(--pink); }
.file-card.other .fi { background: var(--bg-elev-2); color: var(--text-dim); }
.file-card .fi svg { width: 22px; height: 22px; }
.file-card .fn { font-size: 13px; word-break: break-all; line-height: 1.3; }
.file-card .fs { font-size: 10px; color: var(--text-faint); font-family: var(--mono); }

/* TASK CARD WRAPPER \u2014 overlay \xD7 delete on hover */
.task-card-wrap { position: relative; margin-bottom: 14px; }
.task-card-del {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px;
  background: var(--bg-elev); color: var(--text-faint);
  border: 1px solid var(--line);
  border-radius: 100px;
  font-size: 18px; line-height: 1;
  cursor: pointer;
  display: grid; place-items: center;
  opacity: 0;
  transition: all .15s var(--easing);
  z-index: 5;
}
.task-card-wrap:hover .task-card-del,
.task-card-del:focus-visible { opacity: 1; }
.task-card-del:hover { color: var(--danger); border-color: var(--danger); background: rgba(239,68,68,.08); }

/* TASKS (kanban / list) */
.tasks-page { padding: 24px 32px; max-width: 760px; margin: 0 auto; width: 100%; }
.tlist-card {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px 22px;
  margin-bottom: 14px;
  box-shadow: var(--shadow);
}
.tlist-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.tlist-head h2 { margin: 0; font-size: 18px; letter-spacing: -.01em; }
.tlist-progress {
  font-family: var(--mono); font-size: 12px; color: var(--text-faint);
  background: var(--bg-elev-2); padding: 3px 10px; border-radius: 100px;
}
.task-row {
  display: flex; align-items: center; gap: 12px;
  padding: 9px 8px;
  border-radius: 8px;
  transition: background .12s var(--easing);
}
.task-row:hover { background: var(--bg-elev-2); }
.task-row .check {
  width: 18px; height: 18px;
  border: 2px solid var(--text-faint);
  border-radius: 5px;
  display: grid; place-items: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all .15s var(--easing);
}
.task-row.done .check { background: var(--accent); border-color: var(--accent); }
.task-row .check svg { width: 11px; height: 11px; color: white; opacity: 0; transform: scale(.5); transition: all .15s var(--easing); }
.task-row.done .check svg { opacity: 1; transform: scale(1); }
.task-row .lbl { flex: 1; font-size: 14px; cursor: text; }
.task-row.done .lbl { color: var(--text-faint); text-decoration: line-through; }
.task-row .lbl input {
  width: 100%;
  background: transparent; border: none;
  font: inherit; color: var(--text); outline: none;
  border-bottom: 1px solid var(--accent);
}
.task-row .del {
  opacity: 0; transition: opacity .12s var(--easing);
  background: transparent; border: none;
  color: var(--text-faint); cursor: pointer;
  padding: 2px 6px;
}
.task-row:hover .del { opacity: 1; }
.task-row .del:hover { color: var(--danger); }
.task-add {
  display: flex; gap: 8px; margin-top: 10px;
  padding: 4px 8px;
}
.task-add input {
  flex: 1;
  background: var(--bg-elev-2); border: 1px solid var(--line);
  border-radius: 8px; padding: 8px 12px;
  font-family: inherit; font-size: 14px; color: var(--text);
  outline: none;
}
.task-add input:focus { border-color: var(--accent); }

/* NOTES */
.notes-layout {
  display: grid; grid-template-columns: 320px 1fr;
  height: 100%;
}
.notes-list { border-right: 1px solid var(--line); overflow-y: auto; }
.note-item {
  padding: 14px 18px; border-bottom: 1px solid var(--line);
  cursor: pointer;
  transition: background .12s var(--easing);
}
.note-item:hover { background: var(--bg-elev-2); }
.note-item.active { background: var(--accent-soft); }
.note-item .nt { font-weight: 500; font-size: 14px; margin-bottom: 4px; }
.note-item .np {
  font-size: 12px; color: var(--text-dim);
  overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.note-reader { padding: 28px 36px; overflow-y: auto; max-width: 760px; }
.note-reader input.title {
  width: 100%; background: transparent; border: none; outline: none;
  font: 700 26px/1.2 var(--sans); color: var(--text);
  letter-spacing: -.02em; margin-bottom: 12px;
}
.note-reader textarea.body {
  width: 100%; min-height: 50vh;
  background: transparent; border: none; outline: none; resize: vertical;
  font-family: var(--sans); font-size: 15px; line-height: 1.7;
  color: var(--text);
}
.note-reader .meta {
  color: var(--text-faint); font-size: 12px; font-family: var(--mono);
  padding-bottom: 14px; border-bottom: 1px solid var(--line);
  margin-bottom: 18px;
  display: flex; gap: 14px; align-items: center;
}
.note-reader .meta .saving { color: var(--accent); }
.note-reader .meta .saved { color: var(--good); }
.note-reader .meta .err { color: var(--danger); }

/* CALENDAR */
.cal-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid var(--line);
}
.cal-title { font-size: 18px; font-weight: 600; letter-spacing: -.01em; }
.cal-nav { display: flex; gap: 4px; }
.cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr);
  background: var(--line);
  gap: 1px;
  flex: 1;
}
.cal-dow {
  background: var(--bg-elev);
  padding: 8px 12px;
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-faint);
}
.cal-day {
  background: var(--bg-elev);
  padding: 8px;
  min-height: 96px;
  cursor: pointer;
  display: flex; flex-direction: column; gap: 4px;
  position: relative;
  transition: background .12s var(--easing);
}
.cal-day:hover { background: var(--bg-elev-2); }
.cal-day.other { background: var(--bg); color: var(--text-faint); }
.cal-day.today .num {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: white;
  width: 24px; height: 24px;
  border-radius: 50%;
  display: grid; place-items: center;
  font-weight: 600;
}
.cal-day .num { font-size: 13px; font-weight: 500; }
.cal-event {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--text);
  cursor: pointer;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  border-left: 2px solid var(--accent);
}

/* CONTACTS */
.contacts-grid {
  padding: 22px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.contact-card {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px;
  cursor: pointer;
  transition: all .15s var(--easing);
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px;
}
.contact-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: var(--shadow);
}
.contact-card .ava { width: 56px; height: 56px; font-size: 18px; margin-bottom: 4px; }
.contact-card .name { font-weight: 600; font-size: 15px; }
.contact-card .webid {
  font-size: 11px; color: var(--text-faint); font-family: var(--mono);
  word-break: break-all; line-height: 1.4;
}

/* PHOTOS */
.photos-grid {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 6px;
}
.photo {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform .15s var(--easing);
  background: var(--bg-elev-2);
}
.photo:hover { transform: scale(1.02); }
.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.photo .fade {
  position: absolute; inset: auto 0 0 0;
  height: 40%;
  background: linear-gradient(to top, rgba(0,0,0,.7), transparent);
  opacity: 0;
  transition: opacity .15s var(--easing);
  display: flex; align-items: flex-end;
  padding: 8px 10px;
  color: white; font-size: 12px; font-weight: 500;
}
.photo:hover .fade { opacity: 1; }

/* ACTIVITY */
.activity-page { padding: 28px 32px; max-width: 800px; margin: 0 auto; width: 100%; }
.activity-day { margin-bottom: 32px; }
.activity-day .dlabel {
  font-size: 11px; text-transform: uppercase; letter-spacing: .08em;
  color: var(--text-faint); font-weight: 600; margin-bottom: 8px;
}
.activity-stream { position: relative; padding-left: 32px; }
.activity-stream::before {
  content: ""; position: absolute; left: 15px; top: 14px; bottom: 14px; width: 2px;
  background: var(--line);
}
.act-item {
  position: relative;
  padding: 12px 0;
  display: flex; gap: 14px;
}
.act-icon {
  position: absolute; left: -32px;
  width: 32px; height: 32px;
  display: grid; place-items: center;
  background: var(--bg-elev);
  border: 2px solid var(--line);
  border-radius: 50%;
  color: var(--text-dim);
}
.act-icon svg { width: 13px; height: 13px; }
.act-body { font-size: 14px; flex: 1; }
.act-body .when { display: block; color: var(--text-faint); font-size: 12px; margin-top: 3px; }
.act-body a { color: var(--accent); text-decoration: none; }

/* SETTINGS */
.set-section {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 6px 0;
  margin-bottom: 16px;
}
.set-section h2 {
  margin: 0; padding: 16px 22px 10px;
  font-size: 13px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-faint);
  border-bottom: 1px solid var(--line);
}
.set-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 22px;
}
.set-row + .set-row { border-top: 1px solid var(--line); }
.set-row .lbl { font-size: 14px; }
.set-row .desc { color: var(--text-dim); font-size: 12px; margin-top: 2px; }
.set-row .val { font-family: var(--mono); font-size: 13px; color: var(--text-dim); word-break: break-all; max-width: 60%; }
.toggle {
  width: 40px; height: 22px;
  background: var(--bg-elev-3);
  border-radius: 100px;
  border: 1px solid var(--line);
  position: relative;
  cursor: pointer;
  transition: background .2s var(--easing);
}
.toggle.on { background: linear-gradient(135deg, var(--accent), var(--accent-2)); border-color: transparent; }
.toggle .knob {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px;
  background: white;
  border-radius: 50%;
  transition: left .2s var(--easing);
  box-shadow: 0 2px 4px rgba(0,0,0,.2);
}
.toggle.on .knob { left: 20px; }

/* SPOTLIGHT */
.spot-bg {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(6px);
  display: none;
  z-index: 300;
  animation: fadeIn .15s ease;
  padding-top: 14vh;
  justify-content: center;
}
.spot-bg.on { display: flex; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.spot {
  width: min(640px, 92vw);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 30px 80px rgba(0,0,0,.5);
  overflow: hidden;
  height: fit-content;
  max-height: 70vh;
  display: flex; flex-direction: column;
}
.spot-input-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
}
.spot-input-wrap svg { width: 16px; height: 16px; color: var(--text-faint); }
.spot-input {
  flex: 1; background: transparent;
  border: none; outline: none;
  color: var(--text);
  font-family: inherit; font-size: 16px;
}
.spot-results { flex: 1; overflow-y: auto; padding: 8px; }
.spot-r {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.spot-r:hover, .spot-r.sel { background: var(--accent-soft); }

/* TOAST */
.toast {
  position: fixed; bottom: 24px; left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--bg-elev); border: 1px solid var(--line);
  color: var(--text);
  padding: 10px 16px; border-radius: 100px;
  font-size: 13px;
  box-shadow: var(--shadow);
  opacity: 0; pointer-events: none;
  transition: all .25s var(--easing);
  z-index: 400;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.success { border-color: var(--good); }
.toast.error { border-color: var(--danger); }

/* EMPTY / SPINNER */
.empty {
  text-align: center; padding: 48px 24px;
  color: var(--text-faint);
}
.empty svg { width: 48px; height: 48px; opacity: .3; margin-bottom: 14px; }
.spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--line); border-radius: 100px; border: 2px solid var(--bg-elev); }
::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }

/* TABLET \u2014 sidebar tucks away */
@media (max-width: 980px) {
  .shell { grid-template-columns: 56px 0px 1fr; }
  .sidebar { display: none; }
  .main, .main-no-sidebar { grid-column: 2 / -1; }
  .search-trigger { min-width: 0; padding: 7px 10px; }
  .search-trigger .label { display: none; }
  .auth-pill .label { display: none; }
  .auth-pill .name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .breadcrumb { flex-wrap: wrap; }
  /* Default home widgets full-width; per-section overrides below */
  .widget.w-4, .widget.w-6, .widget.w-8 { grid-column: span 12; }
  /* Notes: single-column. Show list by default; reader takes over once
   * you pick a note (JS toggles .has-active on .notes-layout). */
  .notes-layout { grid-template-columns: 1fr; }
  .notes-layout .note-reader { display: none; }
  .notes-layout.has-active .notes-list { display: none; }
  .notes-layout.has-active .note-reader { display: block; }
  /* The back button only appears on mobile when there's something to go back to. */
  .notes-back-mobile { display: inline-flex; align-items: center; gap: 6px; }
}
.notes-back-mobile { display: none; }

/* PHONE \u2014 tighter still */
@media (max-width: 640px) {
  .shell { grid-template-columns: 52px 1fr; }
  .rail { padding: 10px 0; gap: 4px; }
  .rail-item { width: 40px; height: 40px; }
  .brand-mark { width: 30px; height: 30px; }
  .topbar { padding: 0 10px 0 0; }
  .search-trigger { padding: 6px 10px; min-width: 0; }
  .topbar-actions { gap: 4px; }
  .icon-btn { width: 32px; height: 32px; }
  /* Auth pill becomes avatar-only */
  .auth-pill { padding: 3px 3px 3px 3px; }
  .auth-pill .name { display: none; }
  /* Pages: tighter padding */
  .page-pad, .home, .privacy-page, .activity-page, .tasks-page,
  .lightning-page, .vault-page, .swap-page, .music-page,
  .files-toolbar, .files-grid, .photos-grid, .contacts-grid,
  .mail-reader, .note-reader, .settings-page, .activity-page {
    padding-left: 14px; padding-right: 14px;
  }
  .page-pad { padding-top: 18px; padding-bottom: 18px; }
  .topbar-app-title { font-size: 13px; }
  /* Profile hero stacks */
  .profile-hero { flex-direction: column; align-items: flex-start; gap: 14px; }
  .profile-hero .info { width: 100%; }
  .profile-hero h1 { font-size: 22px; }
  .ava.lg { width: 72px; height: 72px; font-size: 24px; }
  .profile-field { grid-template-columns: 80px 1fr; }
  /* File / photo / contact grids: smaller cells */
  .files-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); padding: 14px; }
  .photos-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); padding: 12px; }
  .contacts-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); padding: 16px 14px; }
  /* Calendar grid */
  .cal-day { min-height: 64px; padding: 4px; }
  .cal-day .num { font-size: 12px; }
  .cal-day.today .num { width: 20px; height: 20px; font-size: 11px; }
  .cal-event { font-size: 10px; padding: 1px 4px; }
  .cal-toolbar { padding: 12px 14px; }
  .cal-title { font-size: 16px; }
  /* Bigger touch targets */
  .btn { padding: 9px 14px; font-size: 13px; }
  .nav-item, .sb-item { padding: 10px 16px; }
  /* Settings rows tighten */
  .set-row { padding: 12px 14px; }
  .set-section h2 { padding: 14px 16px 8px; }
  /* Spotlight full-width */
  .spot-bg { padding-top: 8vh; }
  .spot { width: 96vw; }
  /* Tasks page narrower */
  .tasks-page { padding: 16px 14px; max-width: 100%; }
}
`});function Si(){nn.forEach(e=>{try{e(he)}catch(t){console.error(t)}})}function an(e){he.type=e?.type||null,he.id=e?.id||null,he.loggedIn=!!he.id,Si()}function xa(e){return nn.add(e),e(he),()=>nn.delete(e)}function ct(){return he}function xe(e,t){return(window.xlogin&&window.xlogin.authFetch||fetch)(e,t)}function ya(){window.xlogin?.login?.()}function ba(){window.xlogin?.logout?.()}var nn,he,ha,Ti,pt=S(()=>{nn=new Set,he={type:null,id:null,loggedIn:!1};document.addEventListener("xlogin",e=>an(e.detail));document.addEventListener("xlogout",()=>an(null));ha=0,Ti=setInterval(()=>{ha++,window.xlogin&&window.xlogin.id&&!he.loggedIn&&an({type:window.xlogin.type,id:window.xlogin.id}),ha>20&&clearInterval(Ti)},500)});async function L(e){let t=await xe(e,{headers:{Accept:"application/ld+json"}});if(t.status===404)return null;if(!t.ok)throw new Error(`GET ${t.status} ${t.statusText} (${e})`);let n=(t.headers.get("content-type")||"").toLowerCase();if(n.includes("ld+json")||n.includes("application/json"))return t.json();if(n.includes("text/html")){let o=(await t.text()).match(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/i);return o?Di(o[1].trim()):null}throw new Error(`pod returned ${n||"unknown content type"} (need JSON-LD or HTML+island)`)}async function H(e,t){let n=await xe(e,{method:"PUT",headers:{"Content-Type":"application/ld+json"},body:JSON.stringify(t,null,2)});if(!n.ok)throw new Error(`PUT ${n.status} ${n.statusText} (${e})`);return n}async function wa(e,t){let n=await xe(e,{headers:{Accept:"text/html, application/ld+json"}});if(!n.ok)throw new Error(`GET (for safe PUT) ${n.status} ${n.statusText} (${e})`);if((n.headers.get("content-type")||"").toLowerCase().includes("text/html")){let o=await n.text(),r=/(<script\s+type=["']application\/ld\+json["']\s*>)([\s\S]*?)(<\/script>)/i;if(!r.test(o))throw new Error("HTML response with no JSON-LD island \u2014 refusing to overwrite");let i=`
`+JSON.stringify(t,null,2)+`
`,s=o.replace(r,(p,u,d,f)=>u+i+f),l=await xe(e,{method:"PUT",headers:{"Content-Type":"text/html"},body:s});if(!l.ok)throw new Error(`PUT (HTML, island-preserved) ${l.status} ${l.statusText}`);return l}return H(e,t)}async function ce(e){let t=await xe(e,{method:"DELETE"});if(!t.ok&&t.status!==404)throw new Error(`DELETE ${t.status} ${t.statusText} (${e})`);return t}function te(e){return e==null?null:typeof e=="string"?e:Array.isArray(e)?e.length?te(e[0]):null:e["@id"]||e["@value"]||null}function Ni(e,t){for(let n of t)if(e[n]!=null){let a=te(e[n]);if(a)return a}return null}function Mi(e){let t={"@id":e["@id"],"@type":e["@type"],_raw:e};for(let[n,a]of Object.entries(Pi)){let o=Ni(e,a);o&&(t[n]=n==="email"?o.replace(/^mailto:/,""):o)}return t}function re(e,t){let n=Array.isArray(e["@graph"])?e["@graph"]:Array.isArray(e)?e:[e];if(t){let a=n.find(o=>(o["@id"]||"").endsWith("#"+t));if(a)return a}return n[0]}function Di(e){try{return JSON.parse(e)}catch{let t=e.replace(/,(\s*[\}\]])/g,"$1");try{return JSON.parse(t)}catch(n){throw new Error(`JSON-LD parse failed: ${n.message}`)}}}function on(e){if(typeof e!="string")return!1;try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}}async function ie(e){if(!on(e))return null;let t=e.replace(/#.*$/,""),n=await L(t);if(!n)return null;let a=e.includes("#")?e.split("#")[1]:null;return Mi(re(n,a))}async function B(e){if(!on(e))return null;try{let t=e.replace(/#.*$/,""),n=await L(t);if(n){let a=re(n,e.includes("#")?e.split("#")[1]:null),o=a["pim:storage"]??a[Ai+"storage"]??a["space:storage"]??a.storage,r=te(o);if(r)try{return new URL(r,t).href.replace(/\/?$/,"/")}catch{return r.replace(/\/?$/,"/")}}}catch{}try{return new URL(e).origin+"/"}catch{return null}}function Te(e){return e?e.replace(/\/?$/,"/")+"hub/":null}async function F(e){let t=await L(e);if(!t)return[];let n=re(t,null),a=n["ldp:contains"]??n[Ii+"contains"]??n.contains;return a?(Array.isArray(a)?a:[a]).map(r=>{let i=te(r)||r,s=typeof r=="object"&&r["@type"]||null,l=i?.endsWith("/")||/Container/i.test(JSON.stringify(s||""));return{url:i,type:l?"container":"resource"}}).filter(r=>r.url):[]}async function j(e){let t=e.replace(/\/?$/,"/"),n=await xe(t,{method:"HEAD"}).catch(()=>null);if(n&&n.ok)return;let a=await xe(t,{method:"PUT",headers:{"Content-Type":"text/turtle",Link:'<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"'},body:""});if(!a.ok&&a.status!==409)throw new Error(`ensureContainer ${a.status} ${a.statusText}`)}async function I(e){if(!on(e))throw new Error("WebID is not an http(s) URL");let t=await L(e.replace(/#.*$/,""));if(!t)throw new Error("WebID document not found");let n=re(t,e.includes("#")?e.split("#")[1]:null),a=n["solid:publicTypeIndex"]??n[Ve+"publicTypeIndex"]??n.publicTypeIndex,o=Ee(a);if(!o)throw new Error("no solid:publicTypeIndex on WebID");let r=new URL(o,e).href,i=await L(r);if(!i)throw new Error("TypeIndex returned no document");let s=[],l=u=>{if(!(!u||typeof u!="object")){if(Array.isArray(u)){u.forEach(l);return}(u["solid:forClass"]||u[Ve+"forClass"])&&s.push(u);for(let d of Object.values(u))typeof d=="object"&&l(d)}};l(i);let p=s.map(u=>({forClass:Ee(u["solid:forClass"]??u[Ve+"forClass"]),instance:Ee(u["solid:instance"]??u[Ve+"instance"]),instanceContainer:Ee(u["solid:instanceContainer"]??u[Ve+"instanceContainer"]),view:Ee(u["urn:solid:view"]??u.view??u["http://w3id.org/solidos#view"])})).filter(u=>u.forClass&&(u.instance||u.instanceContainer));return p.forEach(u=>{u.instance&&!/^https?:/.test(u.instance)&&(u.instance=new URL(u.instance,r).href),u.instanceContainer&&!/^https?:/.test(u.instanceContainer)&&(u.instanceContainer=new URL(u.instanceContainer,r).href),u.view&&!/^https?:/.test(u.view)&&(u.view=new URL(u.view,r).href)}),{typeIndexUrl:r,registrations:p}}function ut(e,t){return e?e.registrations.filter(n=>n.forClass===t):[]}async function Hi(e,t){let n=await L(e);if(!n)throw new Error(`TypeIndex not found at ${e}`);let a=i=>typeof i=="string"?i:i?.["@id"],o=i=>{let s=a(i["solid:instance"]??i["http://www.w3.org/ns/solid/terms#instance"]),l=a(i["solid:instanceContainer"]??i["http://www.w3.org/ns/solid/terms#instanceContainer"]);return s===t||l===t},r=!1;for(let i of["schema:itemListElement","@graph"])if(Array.isArray(n[i])){let s=n[i].length;n[i]=n[i].filter(l=>!o(l)),n[i].length<s&&(r=!0)}return r?(await H(e,n),!0):!1}async function ka({webid:e,url:t,purgeData:n}){let a=await I(e),o=await Hi(a.typeIndexUrl,t);if(n){let r=t.replace(/#.*$/,"");await ce(r)}return o}async function we(e,{forClass:t,instance:n,instanceContainer:a}){let o=await L(e);if(!o)throw new Error(`TypeIndex not found at ${e}`);let r="#reg-"+Math.random().toString(36).slice(2,9),i={"@id":r,"@type":"solid:TypeRegistration","solid:forClass":{"@id":t}};return n&&(i["solid:instance"]={"@id":n}),a&&(i["solid:instanceContainer"]={"@id":a}),Array.isArray(o["schema:itemListElement"])?o["schema:itemListElement"].push(i):Array.isArray(o["@graph"])?o["@graph"].push(i):o["schema:itemListElement"]=[i],await H(e,o),r}function Re(e){return String(e||"").toLowerCase().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,60)}async function _a({webid:e,name:t}){let n=Re(t);if(!n)throw new Error("Invalid name");let a=await B(e);if(!a)throw new Error("Couldn't find your pod root");let o=await I(e);await j(a+"public/tracker/").catch(()=>{});let r=`${a}public/tracker/${n}-data.jsonld`;return await H(r,{"@context":{"@vocab":"https://w3id.org/workflow#",ical:"http://www.w3.org/2002/12/cal/ical#"},"@id":"#this","@type":"Tracker",title:t,issue:[]}),await we(o.typeIndexUrl,{forClass:J,instance:r+"#this"}),{url:r+"#this"}}async function $a({webid:e,name:t}){let n=Re(t);if(!n)throw new Error("Invalid name");let a=await B(e);if(!a)throw new Error("Couldn't find your pod root");let o=await I(e);await j(a+"public/todo/").catch(()=>{});let r=`${a}public/todo/${n}.jsonld`;return await H(r,{"@context":{schema:"https://schema.org/"},"@id":"#this","@type":"schema:ItemList","schema:name":t,"schema:itemListElement":[]}),await we(o.typeIndexUrl,{forClass:Ye[0],instance:r+"#this"}),{url:r+"#this"}}async function Ca({webid:e,name:t}){let n=Re(t);if(!n)throw new Error("Invalid name");let a=await B(e);if(!a)throw new Error("Couldn't find your pod root");let o=await I(e),r=`${a}hub/notes/${n}/`;return await j(`${a}hub/`).catch(()=>{}),await j(`${a}hub/notes/`).catch(()=>{}),await j(r),await we(o.typeIndexUrl,{forClass:ne[0],instanceContainer:r}),{url:r}}async function La({webid:e,name:t}){let n=Re(t);if(!n)throw new Error("Invalid name");let a=await B(e);if(!a)throw new Error("Couldn't find your pod root");let o=await I(e),r=`${a}hub/calendar/${n}/`;return await j(`${a}hub/`).catch(()=>{}),await j(`${a}hub/calendar/`).catch(()=>{}),await j(r),await we(o.typeIndexUrl,{forClass:ae[0],instanceContainer:r}),{url:r}}async function Ea({webid:e,name:t}){let n=Re(t);if(!n)throw new Error("Invalid name");let a=await B(e);if(!a)throw new Error("Couldn't find your pod root");let o=await I(e),r=`${a}hub/photos/${n}/`;return await j(`${a}hub/`).catch(()=>{}),await j(`${a}hub/photos/`).catch(()=>{}),await j(r),await we(o.typeIndexUrl,{forClass:be[0],instanceContainer:r}),{url:r}}async function zi(e){let t=await B(e);if(!t)throw new Error("Couldn't find your pod root");let n=`${t}hub/bookmarks/`;await j(`${t}hub/`).catch(()=>{}),await j(n);let a=await I(e);return a.registrations.some(r=>r.forClass===ye[0]&&r.instanceContainer)||await we(a.typeIndexUrl,{forClass:ye[0],instanceContainer:n}),n}async function Sa({webid:e,title:t,url:n,description:a}){let o=await zi(e),r=Re(t||new URL(n).hostname)||"bm-"+Date.now(),i=o+r+".jsonld",s={"@context":{bookmark:"http://www.w3.org/2002/01/bookmark#",dc:"http://purl.org/dc/elements/1.1/",dcterms:"http://purl.org/dc/terms/"},"@id":"#this","@type":"bookmark:Bookmark","dc:title":t||n,"bookmark:recalls":{"@id":n},"dc:description":a||"","dcterms:created":new Date().toISOString()};return await H(i,s),{url:i+"#this"}}function Oi(e){return e+Ri}async function ft(e){let t=await I(e).catch(()=>null);if(!t)return null;let n=t.registrations.find(l=>l.forClass===Se&&l.instance);if(!n)return null;let a=await L(n.instance.replace(/#.*$/,"")).catch(()=>null);if(!a)return{url:n.instance,items:[]};let o=re(a,n.instance.includes("#")?n.instance.split("#")[1]:null),r=o["schema:itemListElement"]??o["http://schema.org/itemListElement"]??o["https://schema.org/itemListElement"]??o.itemListElement??[],s=(Array.isArray(r)?r:[r]).map(l=>Ee(l)).filter(Boolean);return{url:n.instance,items:s}}async function vt(e,t){let n=await B(e);if(!n)throw new Error("Couldn't find your pod root");await j(`${n}hub/`).catch(()=>{}),await j(`${n}hub/apps/`).catch(()=>{});let a=Oi(n),o={"@context":{schema:"https://schema.org/",urn:"urn:solid:"},"@id":"#this","@type":"schema:ItemList","schema:name":"Installed apps","schema:itemListElement":(t||[]).map(s=>({"@id":s,"@type":"urn:App"}))};await H(a,o);let r=await I(e).catch(()=>null),i=r?.registrations.some(s=>s.forClass===Se&&s.instance);return r&&!i&&await we(r.typeIndexUrl,{forClass:Se,instance:a+"#this"}),a+"#this"}function ji(e){return e+Ui}async function mt(e){let t=await I(e).catch(()=>null);if(!t)return null;let n=t.registrations.find(l=>l.forClass===ze&&l.instance);if(!n)return null;let a=await L(n.instance.replace(/#.*$/,"")).catch(()=>null);if(!a)return{url:n.instance,defaults:{}};let o=re(a,n.instance.includes("#")?n.instance.split("#")[1]:null),r=o["schema:itemListElement"]??o["http://schema.org/itemListElement"]??o["https://schema.org/itemListElement"]??o.itemListElement??[],i=Array.isArray(r)?r:[r],s={};for(let l of i){if(!l||typeof l!="object")continue;let p=Ee(l["schema:about"]??l["http://schema.org/about"]??l.about),u=l["schema:identifier"]??l["http://schema.org/identifier"]??l.identifier;typeof p=="string"&&typeof u=="string"&&(s[p]=u)}return{url:n.instance,defaults:s}}async function sn(e,t){let n=await B(e);if(!n)throw new Error("Couldn't find your pod root");await j(`${n}hub/`).catch(()=>{}),await j(`${n}hub/prefs/`).catch(()=>{});let a=ji(n),o=Object.entries(t||{}),r={"@context":{schema:"https://schema.org/",urn:"urn:solid:"},"@id":"#this","@type":"urn:PaneDefaults","schema:name":"Pane defaults (per-class chosen pane)","schema:itemListElement":o.map(([l,p])=>({"schema:about":{"@id":l},"schema:identifier":p}))};await H(a,r);let i=await I(e).catch(()=>null),s=i?.registrations.some(l=>l.forClass===ze&&l.instance);return i&&!s&&await we(i.typeIndexUrl,{forClass:ze,instance:a+"#this"}),a+"#this"}var Ii,Ai,He,Ke,Pi,J,be,ne,ae,Ye,ye,rn,Se,ze,Ve,Ee,Ri,Ui,D=S(()=>{pt();Ii="http://www.w3.org/ns/ldp#",Ai="http://www.w3.org/ns/pim/space#",He="http://xmlns.com/foaf/0.1/",Ke="http://www.w3.org/2006/vcard/ns#";Pi={name:["name","foaf:name",He+"name","vcard:fn",Ke+"fn"],nick:["nick","foaf:nick",He+"nick"],email:["email","foaf:mbox",He+"mbox","vcard:hasEmail",Ke+"hasEmail"],homepage:["homepage","foaf:homepage",He+"homepage","vcard:hasURL",Ke+"hasURL"],img:["img","foaf:img",He+"img","foaf:depiction",He+"depiction","vcard:hasPhoto",Ke+"hasPhoto"],bio:["description","schema:description","vcard:note",Ke+"note","bio:olb"]};J="http://www.w3.org/2005/01/wf/flow#Tracker",be=["http://schema.org/ImageGallery","http://schema.org/Photograph","http://schema.org/Photo","http://schema.org/ImageObject","http://xmlns.com/foaf/0.1/Image"],ne=["http://schema.org/TextDocument","http://schema.org/Article","http://schema.org/CreativeWork"],ae=["http://www.w3.org/2002/12/cal/ical#Vcalendar","http://www.w3.org/2002/12/cal/ical#Vevent","http://schema.org/Event"],Ye=["http://schema.org/ItemList","https://schema.org/ItemList"],ye=["http://www.w3.org/2002/01/bookmark#Bookmark"],rn=["https://www.w3.org/ns/activitystreams#Note","http://www.w3.org/ns/activitystreams#Note"],Se="urn:solid:App",ze="urn:solid:PaneDefaults",Ve="http://www.w3.org/ns/solid/terms#",Ee=e=>typeof e=="string"?e:e&&e["@id"]||null;Ri="hub/apps/list.jsonld";Ui="hub/prefs/pane-defaults.jsonld"});var Pa={};N(Pa,{find:()=>ht,getExternalUrls:()=>_e,list:()=>pe,listExternal:()=>Fi,loadAllExternal:()=>cn,loadAndRegister:()=>Qe,register:()=>Ge,removeExternal:()=>Xe,syncFromPod:()=>Ze,syncToPod:()=>dn});function Ge(e){if(!e||typeof e.render!="function"||!e.meta?.id){console.warn("apps.register: ignored \u2014 app must export render() and meta.id",e);return}if(Oe.some(t=>t.meta.id===e.meta.id)){console.warn("apps.register: ignored \u2014 duplicate id",e.meta.id);return}Oe.push(e)}function pe(){return Oe.slice()}function ht(e){return Oe.find(t=>t.meta?.id===e)||null}function ke(){try{return JSON.parse(localStorage.getItem(Ia)||"[]")}catch{return[]}}function ln(e){localStorage.setItem(Ia,JSON.stringify(e))}function _e(){return ke()}async function Xe(e,t=null){let n=ke().filter(o=>o!==e);if(ln(n),t)try{await vt(t,n)}catch(o){console.warn("removeExternal: pod write failed",o)}let a=Oe.findIndex(o=>o.meta?.__externalUrl===e);a!==-1&&Oe.splice(a,1)}async function Qe(e,t=null){let n=await Aa(e);if(!n)throw new Error("App URL didn't expose render() + meta.id");let a=ke();if(!a.includes(e)&&(a.push(e),ln(a),t))try{await vt(t,a)}catch(o){console.warn("loadAndRegister: pod write failed",o)}return Ge(n),n}async function Ze(e){if(!e)return{source:"local",items:ke(),changed:!1};let t;try{t=await ft(e)}catch{t=null}if(!t)return{source:"none",items:ke(),changed:!1};let n=ke(),a=n.length===t.items.length&&n.every((o,r)=>o===t.items[r]);return a||ln(t.items),{source:"pod",items:t.items,changed:!a}}async function dn(e){if(!e)throw new Error("Need a WebID to sync to pod");let t=ke();return await vt(e,t),t}async function cn(){let e=ke();for(let t of e)try{let n=await Aa(t);n&&Ge(n)}catch(n){console.warn("external app failed to load:",t,n)}}async function Aa(e){if(gt.has(e))return gt.get(e);let t=null;try{let n=await import(e);t=Ta(n,e)||Ta(n.default,e)}catch(n){console.warn("external app import failed:",e,n)}return gt.set(e,t),t}function Fi(){return[...gt.entries()].map(([e,t])=>({url:e,loaded:!!t,meta:t?{...t.meta||{}}:null}))}function Ta(e,t){if(!e||typeof e.render!="function")return null;let n={...e.meta||{},__externalUrl:t};return n.id?{meta:n,render:e.render,sidebar:e.sidebar}:null}var Oe,Ia,gt,et=S(()=>{D();Oe=[];Ia="hubpod-apps";gt=new Map});function c(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function $e(e){return e&&e.split(/\s+/).map(t=>t[0]).filter(Boolean).slice(0,2).join("").toUpperCase()||"?"}function oe(e){let t=new Date,n=new Date(e);if(isNaN(n.getTime()))return"";let a=(t-n)/1e3;if(a<60)return"just now";if(a<3600)return Math.floor(a/60)+"m ago";if(a<86400)return Math.floor(a/3600)+"h ago";let o=Math.floor(a/86400);return o<7?o+"d ago":n.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}function x(e,t){let n=v("#toast");n&&(n.textContent=e,n.className="toast show "+(t||""),clearTimeout(x._t),x._t=setTimeout(()=>n.classList.remove("show"),2400))}function Ie(e,t={}){e.innerHTML=`
    <div class="empty">
      ${t.icon||'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'}
      <div>${c(t.title||"Nothing here yet.")}</div>
      ${t.body?`<div style="margin-top:8px;font-size:13px">${c(t.body)}</div>`:""}
    </div>
  `}function U(e,t,n){if(t.auth.type==="solid")return!1;let a=t.auth.type==="nostr";return e.innerHTML=`<div class="content"><div class="page-pad">
    <div class="login-banner">
      <div class="ico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div class="info">
        <strong>${a?"Signed in via Nostr \u2014 Solid required":"Sign in to your Solid pod"}</strong>
        <span>${c(n||"hub-pod stores its data on a Solid pod. Click the floating Login button"+(a?", log out, then sign in again on the Solid tab.":"; pick the Solid tab and choose your provider."))}</span>
      </div>
    </div>
  </div></div>`,!0}function Na(e){e.innerHTML='<div class="spinner"></div>'}function se(e,t=300){let n;return function(...a){clearTimeout(n),n=setTimeout(()=>e.apply(this,a),t)}}function Ue(e,t=""){let n=e?.name||"";return e?.img?`<div class="ava ${t}"><img src="${c(e.img)}" alt="${c(n)}" onerror="this.parentNode.textContent='${c($e(n))}'"></div>`:`<div class="ava ${t}">${c($e(n))}</div>`}var v,T,y,M=S(()=>{v=(e,t=document)=>t.querySelector(e),T=(e,t=document)=>Array.from(t.querySelectorAll(e));y={home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>',user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',files:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',contacts:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',notes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>',tasks:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',photos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',activity:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',chevL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',chevR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',img:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 1 0-7l3-3a5 5 0 0 1 7 7l-1.5 1.5"/><path d="M14 11a5 5 0 0 1 0 7l-3 3a5 5 0 0 1-7-7l1.5-1.5"/></svg>',refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',apps:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'}});var pn={};N(pn,{meta:()=>Qi,render:()=>Bi});async function Bi(e,t){if(t.auth.type!=="solid"){let s=t.auth.type==="nostr";e.innerHTML=`
      <div class="content"><div class="page-pad">
        <h1>Welcome to <span style="background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent">hub-pod</span></h1>
        <p class="lede">A multi-app workspace backed by your Solid pod. Profile, Files, Calendar, Contacts, Notes, Tasks, Photos \u2014 all stored as JSON-LD on a pod you own.</p>

        <div class="login-banner">
          <div class="ico">${y.user}</div>
          <div class="info">
            <strong>${s?"Signed in via Nostr \u2014 Solid required":"Sign in to get started."}</strong>
            <span>${s?"hub-pod stores its data on a Solid pod. Click the floating Login button, log out, then sign in again on the Solid tab.":"Click the floating Login button (bottom-right). xlogin handles Solid OIDC for you \u2014 pick your provider and you're in."}</span>
          </div>
        </div>

        <div class="widgets" style="margin-top:14px">
          ${["profile","files","calendar","contacts","notes","tasks","photos"].map(l=>`
            <div class="widget w-4">
              <h3>${Yi(l)} ${Gi(l)}</h3>
              <div style="color:var(--text-dim);font-size:13px">${Xi(l)}</div>
            </div>
          `).join("")}
        </div>
      </div></div>
    `;return}e.innerHTML=`<div class="content"><div class="page-pad" id="home-page">
    <div class="spinner"></div>
  </div></div>`;let n=v("#home-page"),a=null,o=null;try{a=await ie(t.auth.id),o=await B(t.auth.id)}catch{a=null}let r=Vi(),i=a?.name?.split(" ")?.[0]||"there";n.innerHTML=`
    <h1>${c(r)}, <span style="background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent">${c(i)}</span></h1>
    <p class="lede">Your pod is at <code style="color:var(--accent)">${c(o||"(unknown)")}</code></p>

    <div class="widgets">
      <div class="widget w-6">
        <h3>${y.tasks} Open tasks <a class="more" data-go="tasks">All \u2192</a></h3>
        <div id="home-tasks"><div class="spinner"></div></div>
      </div>

      <div class="widget w-6">
        <h3>${y.calendar} Upcoming events <a class="more" data-go="calendar">Calendar \u2192</a></h3>
        <div id="home-events"><div class="spinner"></div></div>
      </div>

      <div class="widget w-12">
        <h3>${y.notes} Recent notes <a class="more" data-go="notes">All \u2192</a></h3>
        <div id="home-notes"><div class="spinner"></div></div>
      </div>

      <div class="widget w-6">
        <h3>${y.user} Profile <a class="more" data-go="profile">Edit \u2192</a></h3>
        <div style="display:flex;gap:14px;align-items:center">
          ${Ue(a,"")}
          <div>
            <div style="font-weight:500">${c(a?.name||"(no name yet)")}</div>
            <div style="color:var(--text-dim);font-size:13px">${c(a?.email||a?.nick||"")}</div>
            <div style="color:var(--text-faint);font-family:var(--mono);font-size:11px;margin-top:4px;word-break:break-all">${c(t.auth.id)}</div>
          </div>
        </div>
      </div>

      <div class="widget w-6">
        <h3>${y.files} Pod stats <a class="more" data-go="files">Browse \u2192</a></h3>
        <div id="home-pod" style="display:flex;flex-direction:column;gap:8px">
          <div style="color:var(--text-dim);font-size:13px">Pod root: <code style="color:var(--text)">${c(o||"")}</code></div>
          <div id="home-pod-stats" style="color:var(--text-faint);font-size:13px">Counting\u2026</div>
        </div>
      </div>
    </div>
  `,T("[data-go]").forEach(s=>s.addEventListener("click",()=>t.switchApp(s.dataset.go))),Wi(t),qi(t),Ji(t),Ki(t)}async function Wi(e){let t=v("#home-tasks");if(t)try{let n=await I(e.auth.id),a=ut(n,J).filter(i=>i.instance);if(!a.length){t.innerHTML='<div style="color:var(--text-faint);font-size:13px">No trackers registered in your TypeIndex yet.</div>';return}let o=await Promise.all(a.map(i=>L(i.instance.replace(/#.*$/,"")).catch(()=>null))),r=[];if(o.forEach((i,s)=>{if(!i?.issue)return;let l=(a[s].instance||"").split("/").pop().split("#")[0].replace(/-data\.jsonld$/,"").replace(/\.jsonld$/,"");i.issue.forEach(p=>{p.status!=="completed"&&r.push({...p,_tracker:l})})}),!r.length){t.innerHTML='<div style="color:var(--text-faint);font-size:13px">All trackers are inbox zero. \u{1F3AF}</div>';return}t.innerHTML=r.slice(0,6).map(i=>`
      <div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:14px">
        <span style="width:14px;height:14px;border:2px solid var(--text-faint);border-radius:4px;flex-shrink:0"></span>
        <span style="flex:1">${c(i.summary||"(untitled)")}</span>
        <span style="font-size:11px;color:var(--text-faint);font-family:var(--mono)">${c(i._tracker)}</span>
      </div>
    `).join(""),r.length>6&&(t.innerHTML+=`<div style="color:var(--text-faint);font-size:12px;margin-top:6px">+${r.length-6} more</div>`)}catch(n){t.innerHTML=`<div style="color:var(--text-faint);font-size:13px">${c(n.message||"Couldn't load tasks.")}</div>`}}async function qi(e){let t=v("#home-events");if(t)try{let a=(await I(e.auth.id)).registrations.filter(s=>ae.includes(s.forClass)&&(s.instance||s.instanceContainer));if(!a.length){t.innerHTML='<div style="color:var(--text-faint);font-size:13px">No calendar registered.</div>';return}let o=[];await Promise.all(a.map(async s=>{if(s.instanceContainer){let l=await F(s.instanceContainer).catch(()=>[]);await Promise.all(l.filter(p=>p.type==="resource"&&/\.jsonld$/.test(p.url)).map(async p=>{let u=await L(p.url).catch(()=>null);u?.dtstart&&o.push(u)}))}else if(s.instance){let l=await L(s.instance.replace(/#.*$/,"")).catch(()=>null);l?.dtstart&&o.push(l)}}));let r=new Date,i=o.filter(s=>new Date(s.dtstart)>=r).sort((s,l)=>s.dtstart.localeCompare(l.dtstart)).slice(0,4);if(!i.length){t.innerHTML='<div style="color:var(--text-faint);font-size:13px">Nothing scheduled.</div>';return}t.innerHTML=i.map(s=>{let l=new Date(s.dtstart);return`<div style="display:flex;gap:10px;padding:6px 0;font-size:14px;align-items:baseline">
        <span style="font-family:var(--mono);font-size:12px;color:var(--text-dim);min-width:88px">${l.toLocaleDateString("en-GB",{day:"numeric",month:"short"})} ${l.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
        <span>${c(s.summary||"(event)")}</span>
      </div>`}).join("")}catch{t.innerHTML='<div style="color:var(--text-faint);font-size:13px">No events yet.</div>'}}async function Ji(e){let t=v("#home-notes");if(t)try{let a=(await I(e.auth.id)).registrations.filter(i=>ne.includes(i.forClass)&&(i.instance||i.instanceContainer));if(!a.length){t.innerHTML='<div style="color:var(--text-faint);font-size:13px">No notebooks registered.</div>';return}let o=[];await Promise.all(a.map(async i=>{if(i.instanceContainer){let s=await F(i.instanceContainer).catch(()=>[]);await Promise.all(s.filter(l=>l.type==="resource"&&/\.jsonld$/.test(l.url)).map(async l=>{let p=await L(l.url).catch(()=>null);(p?.headline||p?.text)&&o.push(p)}))}else if(i.instance){let s=await L(i.instance.replace(/#.*$/,"")).catch(()=>null);s&&o.push(s)}}));let r=o.sort((i,s)=>(s.datePublished||"").localeCompare(i.datePublished||"")).slice(0,3);if(!r.length){t.innerHTML='<div style="color:var(--text-faint);font-size:13px">No notes yet.</div>';return}t.innerHTML=r.map(i=>`
      <div style="padding:10px 12px;background:var(--bg-elev-2);border-radius:8px;margin-bottom:6px">
        <div style="font-weight:500;font-size:14px">${c(i.headline||"(untitled)")}</div>
        <div style="color:var(--text-dim);font-size:12px;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c((i.text||"").replace(/[\n#*`>]/g," ").slice(0,140))}</div>
        <div style="color:var(--text-faint);font-size:11px;font-family:var(--mono);margin-top:6px">${c(oe(i.datePublished))}</div>
      </div>
    `).join("")}catch{t.innerHTML='<div style="color:var(--text-faint);font-size:13px">No notes yet.</div>'}}async function Ki(e){let t=v("#home-pod-stats");if(t)try{let n=await I(e.auth.id),a=async(m,g)=>{let h=0;return await Promise.all(m.map(async k=>{if(k.instanceContainer){let w=await F(k.instanceContainer).catch(()=>[]);h+=w.filter(E=>E.type==="resource"&&(!g||g(E.url))).length}else k.instance&&(h+=1)})),h},o=n.registrations.filter(m=>ne.includes(m.forClass)),r=n.registrations.filter(m=>ae.includes(m.forClass)),i=n.registrations.filter(m=>be.includes(m.forClass)),s=n.registrations.filter(m=>m.forClass===J&&m.instance),l=(async()=>(await Promise.all(s.map(g=>L(g.instance.replace(/#.*$/,"")).catch(()=>null)))).reduce((g,h)=>g+(h?.issue?.length||0),0))(),[p,u,d,f]=await Promise.all([a(o,m=>/\.jsonld$/.test(m)),l,a(r,m=>/\.jsonld$/.test(m)),a(i,m=>/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(m))]);t.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${p}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">notes</div></div>
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${u}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">tasks</div></div>
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${d}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">events</div></div>
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${f}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">photos</div></div>
      </div>`}catch{t.innerHTML='<div style="color:var(--text-faint);font-size:13px">No TypeIndex available.</div>'}}function Vi(){let e=new Date().getHours();return e<5?"Up late":e<12?"Good morning":e<18?"Good afternoon":"Good evening"}function Yi(e){return y[e==="profile"?"user":e]||y.home}function Gi(e){return e[0].toUpperCase()+e.slice(1)}function Xi(e){return{profile:"Read and edit your WebID profile in place.",files:"Browse the LDP containers under your pod's storage root.",calendar:"iCal-style events stored as JSON-LD.",contacts:"FOAF friends, resolved live from their WebIDs.",notes:"Markdown notes, one resource per note.",tasks:"Kanban tracker \u2014 same shape as SolidOS' tracker-pane.",photos:"A gallery rendered straight from your pod."}[e]||""}var Qi,Ma=S(()=>{D();M();Qi={id:"home",name:"Home",icon:y.home,hasSidebar:!1}});function Ra(){localStorage.setItem("hubpod-pane-defaults",JSON.stringify(K))}function un(){return{...K}}async function Oa(e,t,n=null){if(e&&(t?K[e]=t:delete K[e],Ra(),n))try{await sn(n,K)}catch(a){console.warn("setClassDefault: pod write failed",a)}}async function yt(e){if(!e)return{source:"local",defaults:{...K},changed:!1};let t;try{t=await mt(e)}catch{t=null}if(!t)return{source:"none",defaults:{...K},changed:!1};let n=JSON.stringify(K),a=JSON.stringify(t.defaults);return n!==a&&(K={...t.defaults},Ra()),{source:"pod",defaults:{...K},changed:n!==a}}async function Ua(e){if(!e)throw new Error("Need a WebID to sync to pod");return await sn(e,K),{...K}}function ee(e){if(!e||typeof e.canHandle!="function"||typeof e.render!="function"){console.warn("panes.register: ignored \u2014 pane must export canHandle + render",e);return}le.push(e)}function O(e){let t=e?.forClass&&K[e.forClass];if(t){let n=le.find(a=>a.meta?.id===t);if(n)try{if(n.canHandle(e))return n}catch(a){console.warn("pinned pane canHandle threw:",t,a)}}for(let n of le)try{if(n.canHandle(e))return n}catch(a){console.warn("pane.canHandle threw:",n.meta?.id,a)}return null}function bt(){return le.map(e=>({...e.meta||{}}))}async function wt(e){if(e?.view){let t=await fn(e.view);if(t)try{if(t.canHandle(e))return t}catch(n){console.warn("external pane canHandle threw:",e.view,n)}}return O(e)}async function fn(e){if(xt.has(e))return xt.get(e);let t=null;try{let n=await import(e);t=Y(n,e)||Y(n.default,e),t?.meta&&(t.meta.__externalUrl=e)}catch(n){console.warn("external pane import failed:",e,n)}return xt.set(e,t),t}function ja(){return[...xt.entries()].map(([e,t])=>({url:e,loaded:!!t,meta:t?{...t.meta||{}}:null}))}function kt(){try{return JSON.parse(localStorage.getItem(Fa)||"[]")}catch{return[]}}function Ba(e){localStorage.setItem(Fa,JSON.stringify(e))}function _t(){return kt()}async function $t(e){let t=await fn(e);if(!t)throw new Error("Pane URL didn't expose canHandle + render");le.some(a=>a.meta?.id===t.meta?.id)||le.unshift(t);let n=kt();return n.includes(e)||(n.push(e),Ba(n)),t}function Wa(e){let t=kt().filter(a=>a!==e);Ba(t);let n=le.findIndex(a=>a.meta?.__externalUrl===e);n!==-1&&le.splice(n,1)}async function qa(){let e=kt();for(let t of e)try{let n=await fn(t);n&&!le.some(a=>a.meta?.id===n.meta?.id)&&le.unshift(n)}catch(n){console.warn("external pane failed to load:",t,n)}}function Y(e,t){if(!e||typeof e.canHandle!="function"||typeof e.render!="function")return null;let n=e.render.length>=4||e.canHandle.length>=2,a={id:t,...e.meta||{}};return!a.name&&typeof e.label=="string"&&(a.name=e.label),n?{meta:{...a,name:a.name||`LOSOS pane (${t})`},canHandle(o){let r=Da(o),i=za(o);try{return e.canHandle(r,i,o?.doc||null)}catch{return!1}},async render(o,r,i){let s=f=>o?.onChange?.(f?.detail),l=f=>o?.onDelete?.(f?.detail),p=f=>o?.onOpen?.(f?.detail?.url,f?.detail?.type);r.addEventListener("pane:change",s),r.addEventListener("pane:delete",l),r.addEventListener("pane:open",p);let u=Da(o),d=za(o);return e.render(u,d,r,o?.doc||null,i)}}:{meta:a,canHandle:e.canHandle,render:e.render}}function Da(e){return{value:e?.url||null,termType:"NamedNode"}}function za(e){let t=e?.forClass||(typeof e?.doc?.["@type"]=="string"?e.doc["@type"]:null);return{type:()=>t,get:()=>null,statementsMatching(n,a,o){return t?a===void 0||a?.value===Ha?[{subject:{value:e?.url||null,termType:"NamedNode"},predicate:{value:Ha,termType:"NamedNode"},object:{value:t,termType:"NamedNode"}}]:[]:[]}}}var le,K,xt,Fa,Ha,G=S(()=>{D();le=[],K={};try{K=JSON.parse(localStorage.getItem("hubpod-pane-defaults")||"{}")}catch{K={}}xt=new Map;Fa="hubpod-panes";Ha="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"});var vn={};N(vn,{meta:()=>ns,render:()=>ts,sidebar:()=>es});function es(e){return`
    <div class="sidebar-head"><h2>Profile</h2></div>
    <div class="sidebar-body">
      <div class="sb-section">
        <div class="sb-label">WebID</div>
        <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${c(e.auth.id||"(not signed in)")}</div>
      </div>
    </div>
  `}async function ts(e,t){if(U(e,t,"Profile reads and edits your WebID document \u2014 that's a Solid-only concept."))return;e.innerHTML='<div class="content"><div class="page-pad" id="profile-page"></div></div>';let n=v("#profile-page");Na(n);let a=t.auth.id,o,r;try{o=await ie(a),r=await L(a.replace(/#.*$/,""))}catch(l){Ie(n,{title:"Couldn't load profile",body:l.message});return}if(!o){Ie(n,{title:"WebID returned no profile data"});return}let i={url:a,doc:{profile:o,raw:r,mode:"full"},forClass:Zi},s=O(i);if(!s){Ie(n,{title:"No pane registered for foaf:Person"});return}await s.render(i,n,t)}var Zi,ns,Ja=S(()=>{D();G();M();Zi="http://xmlns.com/foaf/0.1/Person";ns={id:"profile",name:"Profile",icon:y.user,hasSidebar:!0}});async function as(e){if(gn.has(e))return gn.get(e);let t=null;try{t=(await fetch(e,{method:"HEAD",cache:"no-store"})).headers.get("Updates-Via")}catch{}return gn.set(e,t),t}async function os(e){let t=mn.get(e);return t?.ws?.readyState===WebSocket.OPEN?t:t?.ws?.readyState===WebSocket.CONNECTING?(await new Promise(n=>t.ws.addEventListener("open",n,{once:!0})),t):(t={ws:new WebSocket(e),callbacks:new Map},mn.set(e,t),t.ws.addEventListener("message",n=>{let a=String(n.data||"").trim(),o=a.indexOf(" ");if(o<0)return;let r=a.slice(0,o),i=a.slice(o+1);if(r!=="pub")return;let s=t.callbacks.get(i);if(s)for(let l of s)try{l(i)}catch(p){console.warn("notification callback threw",p)}}),t.ws.addEventListener("close",()=>{mn.delete(e)}),await new Promise((n,a)=>{t.ws.addEventListener("open",n,{once:!0}),t.ws.addEventListener("error",a,{once:!0})}),t)}async function Ct(e,t){let n=await as(e);if(!n)return()=>{};let a=await os(n);return a.callbacks.has(e)||(a.callbacks.set(e,new Set),a.ws.send(`sub ${e}`)),a.callbacks.get(e).add(t),()=>{let o=a.callbacks.get(e);if(o&&(o.delete(t),!o.size)){a.callbacks.delete(e);try{a.ws.send(`unsub ${e}`)}catch{}}}}var mn,gn,hn=S(()=>{mn=new Map,gn=new Map});var yn={};N(yn,{meta:()=>ls,render:()=>is,sidebar:()=>rs});function rs(e){return`
    <div class="sidebar-head"><h2>Files</h2></div>
    <div class="sidebar-body">
      <div class="sb-section">
        <div class="sb-label">Locations</div>
        <button class="sb-item" data-go="storage">${y.files} <span>Pod root</span></button>
        <button class="sb-item active" data-go="hub">${y.files} <span>hub-pod data</span></button>
      </div>
      <div class="sb-section">
        <div class="sb-label">Tip</div>
        <div style="padding:6px 18px;font-size:12px;color:var(--text-dim);line-height:1.5">
          Files are real LDP resources on your pod. Click a folder to browse;
          click a file to fetch it in a new tab.
        </div>
      </div>
    </div>
  `}async function is(e,t){if(U(e,t,"Files browses the LDP containers on your Solid pod."))return;if(de=await B(t.auth.id).catch(()=>null),!de){e.innerHTML=`<div class="content"><div class="page-pad"><h1>Files</h1><p class="lede">Couldn't find your pod root.</p></div></div>`;return}let n=window.__hubMashlib?.uri;n&&n.endsWith("/")?ue=n:ue=Te(de),Ka=t,xn=!1,e.innerHTML=`
    <div class="content" style="height:100%;display:flex;flex-direction:column">
      <div class="files-toolbar">
        <div class="breadcrumb" id="files-bc"></div>
        <div></div>
      </div>
      <div id="files-grid" style="padding:18px 24px;flex:1;overflow:auto"><div class="spinner"></div></div>
    </div>
  `,T("[data-go]",v("aside.sidebar")).forEach(a=>a.addEventListener("click",()=>{a.dataset.go==="storage"?ue=de:ue=Te(de),tt()})),tt()}async function tt(){let e=v("#files-grid"),t=v("#files-bc");if(!e||!t)return;t.innerHTML=ss(ue),T(".crumb",t).forEach(o=>o.addEventListener("click",()=>{ue=o.dataset.url,tt()})),xn||(e.addEventListener("pane:open",o=>{let{url:r,type:i}=o?.detail||{};r&&(i==="container"?(ue=r,tt()):window.open(r,"_blank"))}),xn=!0);let n={url:ue,doc:{type:"container"},forClass:"http://www.w3.org/ns/ldp#Container"},a=O(n);if(!a){e.innerHTML='<div class="empty">No ContainerPane registered.</div>';return}await a.render(n,e,Ka),Lt&&(Lt(),Lt=null);try{Lt=await Ct(ue,()=>tt())}catch{}}function ss(e){if(!de||!e)return"";let t=e.startsWith(de)?e.slice(de.length):e;t=t.replace(/\/$/,"");let n=t?t.split("/"):[],a=de,o=`<span class="crumb ${n.length===0?"cur":""}" data-url="${c(de)}">/</span>`;return n.forEach((r,i)=>{a+=r+"/",o+=`<span class="sep">/</span><span class="crumb ${i===n.length-1?"cur":""}" data-url="${c(a)}">${c(decodeURIComponent(r))}</span>`}),o}var de,ue,Ka,xn,Lt,ls,Va=S(()=>{D();G();hn();M();de=null,ue=null,Ka=null,xn=!1,Lt=null;ls={id:"files",name:"Files",icon:y.files,hasSidebar:!0}});var bn={};N(bn,{meta:()=>vs,render:()=>cs,sidebar:()=>ds});function ds(e){return`
    <div class="sidebar-head">
      <h2>Calendar</h2>
      <button class="btn primary" id="cal-new" disabled>${y.plus}</button>
    </div>
    <div class="sidebar-body" id="cal-sb">
      <div style="padding:14px;color:var(--text-faint);font-size:13px">Loading\u2026</div>
    </div>
  `}async function cs(e,t){if(U(e,t,"Calendar discovers calendars via solid:publicTypeIndex."))return;e.innerHTML=`<div class="content" style="height:100%;display:flex;flex-direction:column">
    <div class="cal-toolbar">
      <div class="cal-title" id="cal-title">Loading\u2026</div>
      <div class="cal-nav">
        <button class="icon-btn" data-nav="-1">${y.chevL}</button>
        <button class="icon-btn" data-nav="0" style="font-size:12px;padding:0 12px;width:auto">Today</button>
        <button class="icon-btn" data-nav="+1">${y.chevR}</button>
      </div>
    </div>
    <div id="cal-message" style="padding:0 24px"></div>
    <div class="cal-grid" id="cal-grid" style="flex:0 0 auto"></div>
    <div id="cal-detail" style="flex:1;overflow-y:auto"></div>
  </div>`,fe=[],Ae=null;try{Tt=await I(t.auth.id)}catch(a){us(a);return}let n=Tt.registrations.filter(a=>ae.includes(a.forClass)&&(a.instance||a.instanceContainer));if(!n.length){v("#cal-grid").innerHTML="",v("#cal-message").innerHTML=`
      <div class="card" style="color:var(--text-dim);margin:18px 0;text-align:center;padding:32px 24px">
        <div style="font-size:15px;color:var(--text);margin-bottom:6px">No calendar yet.</div>
        <div style="font-size:13px;margin-bottom:18px">Hub will create a container under <code>/hub/calendar/</code> on your pod and register it as an <code>ical:Vcalendar</code> instance container in your TypeIndex.</div>
        <button class="btn primary" id="empty-new-cal-btn">${y.plus} Create your first calendar</button>
        <div style="margin-top:18px;font-size:12px;color:var(--text-faint)">Or add a TypeRegistration manually with one of: ${ae.map(a=>`<code>${c(a)}</code>`).join(", ")}</div>
      </div>
    `,v("#empty-new-cal-btn").addEventListener("click",()=>fs(t)),ot([]);return}fe=await Promise.all(n.map(ps)),Ae=fe.find(a=>a.kind==="container")||null,at(),ot(fe),T("[data-nav]").forEach(a=>a.addEventListener("click",()=>{let o=parseInt(a.dataset.nav);o===0?ve=new Date:ve.setMonth(ve.getMonth()+o),ve.setDate(1),at()})),Ae&&(v("#cal-new")?.removeAttribute("disabled"),v("#cal-new")?.addEventListener("click",()=>Ga(St(new Date))))}async function ps(e){if(e.instanceContainer)try{let t=await F(e.instanceContainer),n=(await Promise.all(t.filter(a=>a.type==="resource"&&/\.jsonld$/.test(a.url)).map(async a=>{try{let o=await L(a.url);return o?.dtstart?{url:a.url,doc:o}:null}catch{return null}}))).filter(Boolean);return{url:e.instanceContainer,label:Et(e.instanceContainer,"container"),kind:"container",events:n}}catch(t){return{url:e.instanceContainer,label:Et(e.instanceContainer,"container"),kind:"container",events:[],error:t.message}}try{let t=await L(e.instance.replace(/#.*$/,""));return{url:e.instance,label:Et(e.instance,"instance"),kind:"instance",events:t?.dtstart?[{url:e.instance,doc:t}]:[]}}catch(t){return{url:e.instance,label:Et(e.instance,"instance"),kind:"instance",events:[],error:t.message}}}function at(){let e=["January","February","March","April","May","June","July","August","September","October","November","December"];v("#cal-title").textContent=`${e[ve.getMonth()]} ${ve.getFullYear()}`;let t=v("#cal-grid");if(!t)return;let n=fe.flatMap(u=>u.events),a=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(u=>`<div class="cal-dow">${u}</div>`).join(""),o=new Date(ve),r=(o.getDay()+6)%7,i=new Date(o);i.setDate(i.getDate()-r);let l=St(new Date),p=[];for(let u=0;u<42;u++){let d=new Date(i);d.setDate(i.getDate()+u);let f=St(d),m=d.getMonth()===ve.getMonth(),g=n.filter(h=>{try{return St(new Date(h.doc.dtstart))===f}catch{return!1}});p.push(`
      <div class="cal-day ${m?"":"other"} ${f===l?"today":""}" data-day="${f}">
        <div class="num">${d.getDate()}</div>
        ${g.slice(0,3).map(h=>`
          <div class="cal-event" data-url="${c(h.url)}">${c(h.doc.summary||"(event)")}</div>
        `).join("")}
        ${g.length>3?`<div style="font-size:10px;color:var(--text-faint)">+${g.length-3} more</div>`:""}
      </div>
    `)}if(t.innerHTML=a+p.join(""),T(".cal-event[data-url]").forEach(u=>u.addEventListener("click",d=>{d.stopPropagation();let f=n.find(m=>m.url===u.dataset.url);f&&Ya(f)})),nt){let u=n.find(d=>d.url===nt);u?Ya(u):(nt=null,v("#cal-detail")&&(v("#cal-detail").innerHTML=""))}T(".cal-day[data-day]").forEach(u=>u.addEventListener("click",()=>{Ae?Ga(u.dataset.day):x("Register an instanceContainer calendar to add events","error")}))}function ot(e){let t=v("#cal-sb");if(!t||!Tt)return;let a=e.flatMap(o=>o.events).filter(o=>new Date(o.doc.dtstart)>=new Date).sort((o,r)=>o.doc.dtstart.localeCompare(r.doc.dtstart)).slice(0,6);t.innerHTML=`
    <div class="sb-section">
      <div class="sb-label">Calendars</div>
      ${e.length===0?'<div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">None registered</div>':e.map(o=>`
          <button class="sb-item" disabled style="opacity:1">
            ${y.calendar}
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c(o.label)}</span>
            <span class="count">${o.events.length}</span>
          </button>
        `).join("")}
    </div>
    ${a.length?`
      <div class="sb-section">
        <div class="sb-label">Upcoming</div>
        ${a.map(o=>{let r=new Date(o.doc.dtstart);return`<div style="padding:8px 18px;border-bottom:1px solid var(--line);font-size:13px">
            <div style="font-weight:500">${c(o.doc.summary||"(event)")}</div>
            <div style="color:var(--text-faint);font-size:11px;font-family:var(--mono);margin-top:2px">${r.toLocaleDateString("en-GB",{day:"numeric",month:"short"})} \xB7 ${r.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
          </div>`}).join("")}
      </div>
    `:""}
    <div class="sb-section">
      <div class="sb-label">TypeIndex</div>
      <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${c(Tt.typeIndexUrl)}</div>
    </div>
  `}function St(e){return e.getFullYear()+"-"+String(e.getMonth()+1).padStart(2,"0")+"-"+String(e.getDate()).padStart(2,"0")}async function Ga(e){if(!Ae){x("No instanceContainer calendar registered","error");return}let t=prompt("Event title:");if(!t)return;let n=prompt("Time (HH:MM, 24-hour):","09:00")||"09:00",a=`${e}T${n}:00`,o="ev-"+Date.now(),r=Ae.url.replace(/\/?$/,"/")+o+".jsonld",i={"@context":{"@vocab":"http://www.w3.org/2002/12/cal/ical#"},"@id":r,"@type":"Vevent",summary:t,dtstart:a};try{await H(r,i),Ae.events.push({url:r,doc:i}),x("Event created","success"),at(),ot(fe)}catch(s){x("Failed to create event: "+s.message,"error")}}function Ya(e){nt=e.url;let t=v("#cal-detail");if(!t)return;let n=O({url:e.url,doc:e.doc,forClass:"http://www.w3.org/2002/12/cal/ical#Vevent"});if(!n){let a=new Date(e.doc.dtstart);t.innerHTML=`<div class="card" style="margin:18px 24px">${c(e.doc.summary)} \xB7 ${a.toLocaleString("en-GB")}</div>`;return}n.render({url:e.url,doc:e.doc,forClass:"http://www.w3.org/2002/12/cal/ical#Vevent",onChange:()=>{at(),ot(fe)},onDelete:()=>{for(let a of fe)a.events=a.events.filter(o=>o.url!==e.url);nt=null,t.innerHTML="",at(),ot(fe)}},t)}function Et(e,t){if(!e)return"(unknown)";try{if(t==="container"){let n=e.replace(/\/$/,"").split("/");return decodeURIComponent(n[n.length-1]||e)}return e.split("#")[0].split("/").pop().replace(/-data\.jsonld$/,"").replace(/\.jsonld$/,"")}catch{return e}}function us(e){v("#cal-message").innerHTML=`<div class="card" style="color:var(--text-dim);margin-top:18px">
    <div style="color:var(--danger)"><strong>Couldn't read TypeIndex</strong></div>
    <div style="margin-top:8px;font-size:13px">${c(e.message)}</div>
  </div>`,v("#cal-grid").innerHTML="";let t=v("#cal-sb");t&&(t.innerHTML=`<div style="padding:14px;color:var(--text-faint);font-size:13px">${c(e.message)}</div>`)}async function fs(e){let t=prompt('Calendar name (e.g. "Personal", "Work"):');if(!(!t||!t.trim())){x("Creating calendar\u2026");try{await La({webid:e.auth.id,name:t.trim()}),x("Calendar created","success"),e.switchApp("calendar")}catch(n){x("Create failed: "+n.message,"error")}}}var Tt,fe,ve,Ae,nt,vs,Xa=S(()=>{D();G();M();Tt=null,fe=[],ve=new Date;ve.setDate(1);Ae=null,nt=null;vs={id:"calendar",name:"Calendar",icon:y.calendar,hasSidebar:!0}});var wn={};N(wn,{meta:()=>ys,render:()=>xs,sidebar:()=>hs});function hs(e){return`
    <div class="sidebar-head"><h2>Contacts</h2></div>
    <div class="sidebar-body">
      <div class="sb-section">
        <button class="sb-item active">${y.contacts} <span>People you know</span><span class="count" id="contact-count">\u2026</span></button>
      </div>
      <div class="sb-section">
        <div class="sb-label">Source</div>
        <div style="padding:6px 18px;font-size:12px;color:var(--text-dim);line-height:1.5">
          Pulled from <code>foaf:knows</code> on your WebID document.
        </div>
      </div>
    </div>
  `}async function xs(e,t){if(U(e,t,"Contacts reads foaf:knows from your WebID document."))return;e.innerHTML='<div class="content"><div id="contacts-page"><div class="page-pad"><h1>Contacts</h1><p class="lede">Loading your foaf:knows network\u2026</p></div></div></div>';let n=v("#contacts-page"),a=[];try{let p=t.auth.id.replace(/#.*$/,""),u=await L(p);if(!u){Ie(n,{title:"Couldn't fetch WebID"});return}let d=re(u,t.auth.id.includes("#")?t.auth.id.split("#")[1]:null),f=d["foaf:knows"]??d[gs+"knows"]??d.knows;f&&(a=(Array.isArray(f)?f:[f]).map(g=>te(g)).filter(Boolean))}catch(p){Ie(n,{title:"Couldn't load contacts",body:p.message});return}if(v("#contact-count").textContent=a.length,!a.length){n.innerHTML=`<div class="page-pad">
      <h1>Contacts</h1>
      <p class="lede">No contacts found.</p>
      <div class="login-banner" style="margin-top:24px">
        <div class="ico">${y.contacts}</div>
        <div class="info">
          <strong>To add contacts</strong>
          <span>Edit your WebID profile and add <code>foaf:knows</code> entries pointing at other WebIDs. They'll appear here automatically.</span>
        </div>
      </div>
    </div>`;return}n.innerHTML='<div id="contacts-grid" style="padding:22px 24px"></div>';let o=v("#contacts-grid"),r=await Promise.all(a.map(p=>ie(p).catch(()=>null))),s={doc:{items:a.map((p,u)=>({url:p,doc:{profile:r[u],mode:"card"},forClass:ms})),layout:"grid"}},l=O(s);l&&await l.render(s,o,t)}var ms,gs,ys,Qa=S(()=>{D();G();M();ms="http://xmlns.com/foaf/0.1/Person",gs="http://xmlns.com/foaf/0.1/";ys={id:"contacts",name:"Contacts",icon:y.contacts,hasSidebar:!0}});var _n={};N(_n,{meta:()=>Ls,render:()=>ws,sidebar:()=>bs});function bs(e){return`
    <div class="sidebar-head">
      <h2>Notes</h2>
      <button class="btn primary" id="new-note" title="New note" disabled>${y.plus}</button>
    </div>
    <div class="sidebar-body" id="notes-sb">
      <div style="padding:14px;color:var(--text-faint);font-size:13px">Loading\u2026</div>
    </div>
  `}async function ws(e,t){if(U(e,t,"Notes discovers notebooks via solid:publicTypeIndex."))return;Pt=t,e.innerHTML=`<div class="content"><div class="notes-layout" id="notes-layout">
    <div class="notes-list" id="notes-list"><div class="spinner"></div></div>
    <div class="note-reader" id="note-reader"><div class="empty">Pick a note or create a new one.</div></div>
  </div></div>`,X=[],Pe=new Map,At=null;try{je=await I(t.auth.id)}catch(o){$s(o);return}let n=je.registrations.filter(o=>ne.includes(o.forClass)&&(o.instance||o.instanceContainer));if(!n.length){Cs(),v("#empty-new-notebook-btn")?.addEventListener("click",()=>no(t));return}X=await Promise.all(n.map(ks)),rt(),to(),v("#new-note")?.removeAttribute("disabled"),v("#new-note")?.addEventListener("click",()=>_s(t));let a=X.flatMap(o=>o.notes)[0];a?kn(a.url,a.doc,eo(a.url),t):v("#note-reader").innerHTML='<div class="empty">No notes yet \u2014 click + to create one.</div>'}async function ks(e){if(e.instanceContainer)try{let n=(await F(e.instanceContainer)).filter(o=>o.type==="resource"&&/\.jsonld$/.test(o.url)),a=(await Promise.all(n.map(async o=>{try{let r=await L(o.url);return r?{url:o.url,doc:r}:null}catch{return null}}))).filter(Boolean);return a.forEach(o=>Pe.set(o.url,o.doc)),{url:e.instanceContainer,label:It(e.instanceContainer,"container"),kind:"container",forClass:e.forClass,notes:a.sort((o,r)=>(r.doc.datePublished||"").localeCompare(o.doc.datePublished||""))}}catch(t){return{url:e.instanceContainer,label:It(e.instanceContainer,"container"),kind:"container",forClass:e.forClass,notes:[],error:t.message}}try{let t=await L(e.instance.replace(/#.*$/,""));return t&&Pe.set(e.instance,t),{url:e.instance,label:It(e.instance,"instance"),kind:"instance",forClass:e.forClass,notes:t?[{url:e.instance,doc:t}]:[]}}catch(t){return{url:e.instance,label:It(e.instance,"instance"),kind:"instance",forClass:e.forClass,notes:[],error:t.message}}}function eo(e){return X.find(t=>t.notes.some(n=>n.url===e))?.forClass}function rt(){let e=v("#notes-list");if(!e)return;if(!X.reduce((n,a)=>n+a.notes.length,0)){e.innerHTML=`
      <div class="empty">
        <div>${X.length} notebook${X.length===1?"":"s"} discovered, but no notes yet.</div>
        <div style="margin-top:8px;font-size:13px">Click + to create your first.</div>
      </div>
    `;return}X.length===1?e.innerHTML=X[0].notes.map(Za).join(""):e.innerHTML=X.map(n=>`
      <div style="padding:6px 14px 4px;font-size:11px;font-weight:600;color:var(--text-faint);text-transform:uppercase;letter-spacing:.06em;background:var(--bg);position:sticky;top:0">${c(n.label)} <span style="font-family:var(--mono);font-weight:400">\xB7 ${n.notes.length}</span></div>
      ${n.notes.map(Za).join("")}
    `).join(""),T("[data-note]",e).forEach(n=>{n.addEventListener("click",()=>{let a=n.dataset.note,o=Pe.get(a),r=Pt;kn(a,o,eo(a),r)})})}function Za(e){return`
    <div class="note-item ${e.url===At?"active":""}" data-note="${c(e.url)}">
      <div class="nt">${c(e.doc.headline||"(untitled)")}</div>
      <div class="np">${c((e.doc.text||"").slice(0,110).replace(/[#*`>\n]/g," "))}</div>
      <div style="margin-top:6px;font-size:11px;color:var(--text-faint);font-family:var(--mono)">${c(oe(e.doc.datePublished))}</div>
    </div>
  `}function to(){let e=v("#notes-sb");if(!(!e||!je)){if(!X.length){e.innerHTML=`
      <div class="sb-section">
        <div class="sb-label">Discovered</div>
        <div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">No notebooks</div>
      </div>
      <div class="sb-section">
        <div class="sb-label">TypeIndex</div>
        <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${c(je.typeIndexUrl)}</div>
      </div>
    `;return}e.innerHTML=`
    <div class="sb-section">
      <div class="sb-label">Notebooks</div>
      ${X.map(t=>`
        <button class="sb-item" disabled style="opacity:1">
          ${y.notes}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c(t.label)}</span>
          <span class="count">${t.notes.length}</span>
        </button>
      `).join("")}
      <button class="sb-item" id="new-notebook-btn" style="color:var(--accent)">
        ${y.plus}
        <span>New notebook</span>
      </button>
    </div>
    <div class="sb-section">
      <div class="sb-label">TypeIndex</div>
      <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${c(je.typeIndexUrl)}</div>
    </div>
  `,v("#new-notebook-btn")?.addEventListener("click",()=>no(Pt))}}async function kn(e,t,n,a){if(Pt=a,At=e,rt(),!t)try{t=await L(e),Pe.set(e,t)}catch(s){x("Failed to load note: "+s.message,"error");return}v("#notes-layout")?.classList.add("has-active");let o=v("#note-reader");o.innerHTML=`
    <button class="btn notes-back-mobile" id="notes-back-mobile" style="margin-bottom:14px">\u2190 Back to list</button>
    <div id="note-reader-pane"></div>
  `,v("#notes-back-mobile").addEventListener("click",()=>{v("#notes-layout")?.classList.remove("has-active")});let r=O({url:e,doc:t,forClass:n}),i=v("#note-reader-pane");if(!r){i.innerHTML=`<div class="empty">No pane registered for this note's @type.<div style="margin-top:6px;font-family:var(--mono);font-size:11px;color:var(--text-faint)">${c(e)}</div></div>`;return}await r.render({url:e,doc:t,forClass:n,onChange:()=>{rt()},onDelete:()=>{Pe.delete(e);for(let s of X)s.notes=s.notes.filter(l=>l.url!==e);At=null,rt(),v("#note-reader").innerHTML='<div class="empty">Pick a note or create a new one.</div>',v("#notes-layout")?.classList.remove("has-active")}},i,a)}async function _s(e){let t=X.find(r=>r.kind==="container");if(!t){x("Need a notebook registered with solid:instanceContainer to create new notes","error");return}let n="note-"+new Date().toISOString().replace(/[:.]/g,"-").slice(0,19),a=t.url.replace(/\/?$/,"/")+n+".jsonld",o={"@context":{"@vocab":"https://schema.org/"},"@id":a,"@type":"TextDocument",headline:"Untitled note",datePublished:new Date().toISOString(),encodingFormat:"text/markdown",text:""};try{await H(a,o),Pe.set(a,o),t.notes.unshift({url:a,doc:o}),x("Note created","success"),rt(),to(),kn(a,o,t.forClass,e),setTimeout(()=>v("#note-title")?.focus(),50)}catch(r){x("Create failed: "+r.message,"error")}}function It(e,t){if(!e)return"(unknown)";try{if(t==="container"){let n=e.replace(/\/$/,"").split("/");return decodeURIComponent(n[n.length-1]||e)}return e.split("#")[0].split("/").pop().replace(/-data\.jsonld$/,"").replace(/\.jsonld$/,"")}catch{return e}}function $s(e){v("#notes-list").innerHTML=`<div class="empty">
    <div style="color:var(--danger)"><strong>Couldn't read TypeIndex</strong></div>
    <div style="margin-top:8px;font-size:13px">${c(e.message)}</div>
  </div>`;let t=v("#notes-sb");t&&(t.innerHTML=`<div style="padding:14px;color:var(--text-faint);font-size:13px">${c(e.message)}</div>`)}function Cs(){v("#notes-list").innerHTML="",v("#note-reader").innerHTML=`
    <div class="card" style="color:var(--text-dim);max-width:640px;text-align:center;padding:32px 24px">
      <div style="font-size:15px;color:var(--text);margin-bottom:6px">No notebooks yet.</div>
      <div style="font-size:13px;margin-bottom:18px">Hub will create a container under <code>/hub/notes/</code> on your pod and register it as a <code>schema:TextDocument</code> instance container in your TypeIndex.</div>
      <button class="btn primary" id="empty-new-notebook-btn">${y.plus} Create your first notebook</button>
      <div style="margin-top:18px;font-size:12px;color:var(--text-faint)">Or add a TypeRegistration manually with one of: ${ne.map(t=>`<code>${c(t)}</code>`).join(", ")}</div>
    </div>
  `;let e=v("#notes-sb");e&&(e.innerHTML=`
      <div class="sb-section">
        <div class="sb-label">Discovered</div>
        <div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">No notebooks</div>
      </div>
      <div class="sb-section">
        <div class="sb-label">TypeIndex</div>
        <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${c(je.typeIndexUrl)}</div>
      </div>
    `)}async function no(e){if(!e)return;let t=prompt('Notebook name (e.g. "Daily", "Ideas"):');if(!(!t||!t.trim())){x("Creating notebook\u2026");try{await Ca({webid:e.auth.id,name:t.trim()}),x("Notebook created","success"),e.switchApp("notes")}catch(n){x("Create failed: "+n.message,"error")}}}var je,X,At,Pe,Pt,Ls,ao=S(()=>{D();G();M();je=null,X=[],At=null,Pe=new Map;Pt=null;Ls={id:"notes",name:"Notes",icon:y.notes,hasSidebar:!0}});var Cn={};N(Cn,{meta:()=>As,render:()=>Ss,sidebar:()=>Es});function Es(e){return`
    <div class="sidebar-head"><h2>Tasks</h2></div>
    <div class="sidebar-body" id="tasks-sb">
      <div style="padding:14px;color:var(--text-faint);font-size:13px">Loading\u2026</div>
    </div>
  `}async function Ss(e,t){if(U(e,t,"Tasks discovers wf:Tracker resources from your solid:publicTypeIndex."))return;e.innerHTML=`<div class="content"><div class="tasks-page" id="tasks-page">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div>
        <h2 style="margin:0;font-size:22px;letter-spacing:-.01em">Tasks</h2>
        <div id="tasks-status" style="color:var(--text-dim);font-size:13px;margin-top:4px">Discovering trackers\u2026</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn primary" id="new-tracker-btn">${y.plus} Tracker</button>
        <button class="btn" id="new-list-btn">${y.plus} List</button>
      </div>
    </div>
    <div id="tasks-body"><div class="spinner"></div></div>
  </div></div>`,v("#new-tracker-btn").addEventListener("click",()=>Mt(t,"tracker")),v("#new-list-btn").addEventListener("click",()=>Mt(t,"list")),Nt=[];try{Fe=await I(t.auth.id)}catch(i){v("#tasks-body").innerHTML=`<div class="card" style="color:var(--text-dim)">
      <div style="color:var(--danger);margin-bottom:8px"><strong>Couldn't read your TypeIndex.</strong></div>
      <div style="font-size:13px">${c(i.message)}</div>
    </div>`,v("#tasks-status").textContent="TypeIndex not available",$n();return}let n=Fe.registrations.filter(i=>i.instance&&(i.forClass===J||Ye.includes(i.forClass))),a=n.filter(i=>i.forClass===J).length,o=n.filter(i=>Ye.includes(i.forClass)).length;if(v("#tasks-status").textContent=`${n.length} item${n.length===1?"":"s"} discovered via TypeIndex`+(a&&o?` (${a} tracker${a===1?"":"s"}, ${o} list${o===1?"":"s"})`:"")+` (${Ts(Fe.typeIndexUrl)})`,!n.length){v("#tasks-body").innerHTML=`
      <div class="card" style="color:var(--text-dim);text-align:center;padding:32px 24px">
        <div style="font-size:15px;color:var(--text);margin-bottom:6px">No trackers or lists yet.</div>
        <div style="font-size:13px;margin-bottom:18px">Hub will create the file on your pod and register it in your TypeIndex.</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn primary" id="empty-new-tracker-btn">${y.plus} New tracker (kanban)</button>
          <button class="btn" id="empty-new-list-btn">${y.plus} New todo list</button>
        </div>
      </div>
    `,v("#empty-new-tracker-btn").addEventListener("click",()=>Mt(t,"tracker")),v("#empty-new-list-btn").addEventListener("click",()=>Mt(t,"list")),$n();return}Nt=await Promise.all(n.map(async i=>{try{let s=await L(i.instance.replace(/#.*$/,""));return{url:i.instance,doc:s,view:i.view,forClass:i.forClass}}catch(s){return{url:i.instance,doc:null,error:s.message,view:i.view,forClass:i.forClass}}}));let r=v("#tasks-body");r.innerHTML="";for(let i=0;i<Nt.length;i++){let s=Nt[i],l=document.createElement("div");l.className="task-card-wrap",l.dataset.trackerIdx=i;let p=document.createElement("div"),u=document.createElement("button");u.className="task-card-del",u.title="Remove from TypeIndex\u2026",u.innerHTML="\xD7",u.addEventListener("click",()=>Is(s,t)),l.appendChild(p),l.appendChild(u),r.appendChild(l);let d={url:s.url,doc:s.doc,forClass:s.forClass,view:s.view},f=await wt(d);if(f)try{await f.render(d,p,t)}catch(m){p.innerHTML=`<div class="card" style="color:var(--danger)">Pane error: ${c(m.message)}</div>`}else p.innerHTML=`<div class="card" style="color:var(--text-dim)">
        No pane available for <code>${c(s.forClass||"(unknown class)")}</code>.
        ${s.view?`<div style="margin-top:6px;font-size:12px">External view URL: <code>${c(s.view)}</code> failed to load.</div>`:""}
        <div style="margin-top:6px;font-size:12px;color:var(--text-faint);font-family:var(--mono);word-break:break-all">${c(s.url)}</div>
      </div>`}$n()}function $n(){let e=v("#tasks-sb");if(!e)return;if(!Fe){e.innerHTML='<div style="padding:14px;color:var(--text-faint);font-size:13px">No TypeIndex.</div>';return}let t=Fe.registrations.filter(n=>n.instance&&(n.forClass===J||Ye.includes(n.forClass)));e.innerHTML=`
    <div class="sb-section">
      <div class="sb-label">Discovered</div>
      ${t.length===0?'<div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">None</div>':t.map((n,a)=>`
          <button class="sb-item" data-scroll="${a}" title="${c(n.forClass)}">
            ${y.tasks}
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c(oo(n.instance))}</span>
            <span style="margin-left:auto;font:600 9px var(--mono);letter-spacing:.06em;color:var(--text-faint);text-transform:uppercase">${n.forClass===J?"trk":"list"}</span>
          </button>
        `).join("")}
    </div>
    <div class="sb-section">
      <div class="sb-label">TypeIndex</div>
      <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${c(Fe.typeIndexUrl)}</div>
    </div>
  `,T("[data-scroll]",e).forEach(n=>n.addEventListener("click",()=>{v(`[data-tracker-idx="${n.dataset.scroll}"]`)?.scrollIntoView({behavior:"smooth",block:"start"})}))}function oo(e){if(!e)return"(no instance)";try{return e.split("#")[0].split("/").pop().replace(/-data\.jsonld$/,"").replace(/\.jsonld$/,"")||e}catch{return e}}function Ts(e){if(!e)return"";try{let t=new URL(e);return t.hostname+t.pathname.replace(/\/$/,"")}catch{return e}}async function Is(e,t){let n=(e.url||"").replace(/#.*$/,""),a=oo(e.url)||n;if(!confirm(`Remove "${a}" from your TypeIndex?

${e.url}`))return;let o=confirm(`Also delete the data file?

OK   = delete ${n}
Cancel = keep the file (orphan), only the registration is removed.`);x("Deleting\u2026");try{await ka({webid:t.auth.id,url:e.url,purgeData:o}),x(o?"Deleted (registration + file)":"Removed from TypeIndex (file kept)","success"),t.switchApp("tasks")}catch(r){x("Delete failed: "+r.message,"error")}}async function Mt(e,t="tracker"){let n=t==="list"?"Todo list":"Tracker",a=prompt(`${n} name (e.g. "Work", "Groceries"):`);if(!(!a||!a.trim())){x(`Creating ${n.toLowerCase()}\u2026`);try{t==="list"?await $a({webid:e.auth.id,name:a.trim()}):await _a({webid:e.auth.id,name:a.trim()}),x(`${n} created`,"success"),e.switchApp("tasks")}catch(o){x("Create failed: "+o.message,"error")}}}var Fe,Nt,As,ro=S(()=>{D();G();M();Fe=null,Nt=[];As={id:"tasks",name:"Tasks",icon:y.tasks,hasSidebar:!0}});var En={};N(En,{meta:()=>Rs,render:()=>Ns,sidebar:()=>Ps});function Ps(e){return`
    <div class="sidebar-head"><h2>Photos</h2></div>
    <div class="sidebar-body" id="photos-sb">
      <div style="padding:14px;color:var(--text-faint);font-size:13px">Loading\u2026</div>
    </div>
  `}async function Ns(e,t){if(U(e,t,"Photos discovers image collections via solid:publicTypeIndex."))return;e.innerHTML=`<div class="content">
    <div style="padding:18px 22px;border-bottom:1px solid var(--line)">
      <h1 style="margin:0;font-size:22px;letter-spacing:-.01em">Photos</h1>
      <div id="photos-status" style="color:var(--text-dim);font-size:13px;margin-top:4px">Discovering image collections\u2026</div>
    </div>
    <div id="photos-body"><div class="spinner"></div></div>
  </div>`,me=[];try{Be=await I(t.auth.id)}catch(a){v("#photos-body").innerHTML=`<div class="page-pad"><div class="card" style="color:var(--text-dim)">
      <div style="color:var(--danger);margin-bottom:8px"><strong>Couldn't read your TypeIndex.</strong></div>
      <div style="font-size:13px">${c(a.message)}</div>
    </div></div>`,v("#photos-status").textContent="TypeIndex not available",Ln();return}let n=Be.registrations.filter(a=>be.includes(a.forClass)&&(a.instance||a.instanceContainer));if(v("#photos-status").innerHTML=n.length?`${n.length} image registration${n.length===1?"":"s"} discovered via <code style="color:var(--accent)">${c(Be.typeIndexUrl)}</code>`:"No image registrations in your TypeIndex yet",!n.length){v("#photos-body").innerHTML=`<div class="page-pad"><div class="card" style="color:var(--text-dim);text-align:center;padding:32px 24px;max-width:640px;margin:0 auto">
      <div style="font-size:15px;color:var(--text);margin-bottom:6px">No image collections yet.</div>
      <div style="font-size:13px;margin-bottom:18px">Hub will create a container under <code>/hub/photos/</code> on your pod and register it as a <code>schema:ImageGallery</code> instance container in your TypeIndex. Drop images into the folder afterwards (any pod-aware file tool).</div>
      <button class="btn primary" id="empty-new-gallery-btn">${y.plus} Create your first gallery</button>
      <div style="margin-top:18px;font-size:12px;color:var(--text-faint)">Or add a TypeRegistration manually with one of: ${be.map(a=>`<code>${c(a)}</code>`).join(", ")}</div>
    </div></div>`,v("#empty-new-gallery-btn").addEventListener("click",()=>zs(t)),Ln();return}me=await Promise.all(n.map(Ms)),Hs(),Ln()}async function Ms(e){if(e.instanceContainer)try{let n=(await F(e.instanceContainer)).filter(a=>a.type==="resource"&&/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(a.url)).map(a=>({src:a.url,title:decodeURIComponent(a.url.split("/").pop())}));return{url:e.instanceContainer,label:Dt(e.instanceContainer,"container"),kind:"container",images:n}}catch(t){return{url:e.instanceContainer,label:Dt(e.instanceContainer,"container"),kind:"container",images:[],error:t.message}}try{let t=await L(e.instance.replace(/#.*$/,""));return{url:e.instance,label:Dt(e.instance,"instance"),kind:"instance",images:Ds(t)}}catch(t){return{url:e.instance,label:Dt(e.instance,"instance"),kind:"instance",images:[],error:t.message}}}function Ds(e){if(!e)return[];let t=[],n=/^(image|photo|depiction|contentUrl|thumbnail|hasPhoto|img)$/i,a=/(foaf\/0\.1\/(?:depiction|img)|schema\.org\/(?:image|contentUrl|thumbnail|photo))/i,o=r=>{if(!(!r||typeof r!="object")){if(Array.isArray(r)){r.forEach(o);return}for(let[i,s]of Object.entries(r)){let l=i.includes(":")||i.includes("/")?i.split(/[/:]/).pop():i;if(n.test(l)||a.test(i)){let p=Array.isArray(s)?s:[s];for(let u of p){let d=te(u);typeof d=="string"&&/\.(png|jpe?g|gif|webp|svg|avif)/i.test(d)&&t.push({src:d,title:d.split("/").pop().split("?")[0]})}}typeof s=="object"&&o(s)}}};return o(e),t}function Hs(){let e=v("#photos-body");if(!e)return;if(me.reduce((n,a)=>n+a.images.length,0)===0){e.innerHTML=`<div class="page-pad"><div class="card" style="color:var(--text-dim)">
      <strong>${me.length} image collection${me.length===1?"":"s"} registered</strong>, but no images found inside.
      <div style="font-size:13px;margin-top:8px">${me.map(n=>`
        <div style="padding:6px 0;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:12px">
          <div>${c(n.label)} <span style="color:var(--text-faint)">\xB7 ${n.kind}</span></div>
          <div style="word-break:break-all;color:var(--text-faint);font-size:11px">${c(n.url)}</div>
          ${n.error?`<div style="color:var(--danger);font-size:11px">${c(n.error)}</div>`:""}
        </div>
      `).join("")}</div>
    </div></div>`;return}e.innerHTML="",me.forEach((n,a)=>{if(n.images.length===0)return;let o=document.createElement("div");o.style.padding="18px 22px",o.style.borderBottom="1px solid var(--line)",o.innerHTML=`
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:10px">
        <h3 style="margin:0;font-size:14px;font-weight:600">${c(n.label)}</h3>
        <span style="color:var(--text-faint);font-size:11px;font-family:var(--mono)">${n.images.length} image${n.images.length===1?"":"s"} \xB7 ${c(n.kind)}</span>
      </div>
    `;let r=document.createElement("div");r.className="photos-grid",r.style.padding="0",o.appendChild(r),n.images.forEach(i=>{let s={url:i.src,doc:{title:i.title}},l=O(s),p=document.createElement("div");r.appendChild(p),l?l.render(s,p):p.outerHTML=`<div class="photo" data-src="${c(i.src)}"><img src="${c(i.src)}" loading="lazy"></div>`}),e.appendChild(o)})}function Ln(){let e=v("#photos-sb");if(e){if(!Be){e.innerHTML='<div style="padding:14px;color:var(--text-faint);font-size:13px">No TypeIndex.</div>';return}if(!me.length){e.innerHTML=`
      <div class="sb-section">
        <div class="sb-label">Discovered</div>
        <div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">No image registrations</div>
      </div>
      <div class="sb-section">
        <div class="sb-label">TypeIndex</div>
        <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${c(Be.typeIndexUrl)}</div>
      </div>
    `;return}e.innerHTML=`
    <div class="sb-section">
      <div class="sb-label">Galleries</div>
      ${me.map((t,n)=>`
        <button class="sb-item" data-scroll="${n}">
          ${y.photos}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c(t.label)}</span>
          <span class="count">${t.images.length}</span>
        </button>
      `).join("")}
    </div>
    <div class="sb-section">
      <div class="sb-label">TypeIndex</div>
      <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${c(Be.typeIndexUrl)}</div>
    </div>
  `,T("[data-scroll]",e).forEach(t=>t.addEventListener("click",()=>{let n=+t.dataset.scroll;T("#photos-body > div")[n]?.scrollIntoView({behavior:"smooth",block:"start"})}))}}function Dt(e,t){if(!e)return"(unknown)";try{if(t==="container"){let n=e.replace(/\/$/,"").split("/");return decodeURIComponent(n[n.length-1]||e)}return e.split("#")[0].split("/").pop().replace(/-data\.jsonld$/,"").replace(/\.jsonld$/,"")}catch{return e}}async function zs(e){let t=prompt('Gallery name (e.g. "Travel", "2026"):');if(!(!t||!t.trim())){x("Creating gallery\u2026");try{await Ea({webid:e.auth.id,name:t.trim()}),x("Gallery created","success"),e.switchApp("photos")}catch(n){x("Create failed: "+n.message,"error")}}}var Be,me,Rs,io=S(()=>{D();G();M();Be=null,me=[];Rs={id:"photos",name:"Photos",icon:y.photos,hasSidebar:!0}});var Sn={};N(Sn,{meta:()=>Fs,render:()=>Os});async function Os(e,t){if(U(e,t,"Activity is synthesized from changes to your hub-pod data on a Solid pod."))return;e.innerHTML=`<div class="content"><div class="activity-page" id="activity-page">
    <h1>Activity</h1>
    <p class="lede">Recent changes across your hub-pod apps.</p>
    <div id="activity-stream"><div class="spinner"></div></div>
  </div></div>`;let n=await B(t.auth.id).catch(()=>null);if(!n)return;let a=Te(n),o=[];try{let i=await F(a+"notes/");await Promise.all(i.filter(s=>s.type==="resource"&&/\.jsonld$/.test(s.url)).map(async s=>{let l=await L(s.url).catch(()=>null);l?.datePublished&&o.push({ts:l.datePublished,app:"notes",icon:y.notes,text:`wrote <a data-go="notes">${c(l.headline||"(untitled note)")}</a>`})}))}catch{}try{let i=await L(a+"tasks/list.jsonld").catch(()=>null);i?.issue&&i.issue.forEach(s=>{s.created&&o.push({ts:s.created,app:"tasks",icon:y.tasks,text:`added task <a data-go="tasks">${c(s.summary)}</a>`}),s.completed&&o.push({ts:s.completed,app:"tasks",icon:y.check,text:`completed <a data-go="tasks">${c(s.summary)}</a>`})})}catch{}try{let i=await F(a+"calendar/");await Promise.all(i.filter(s=>s.type==="resource"&&/\.jsonld$/.test(s.url)).map(async s=>{let l=await L(s.url).catch(()=>null);l?.dtstart&&o.push({ts:l.dtstart,app:"calendar",icon:y.calendar,text:`event <a data-go="calendar">${c(l.summary||"(event)")}</a>`})}))}catch{}if(o.sort((i,s)=>(s.ts||"").localeCompare(i.ts||"")),!o.length){v("#activity-stream").innerHTML='<div class="empty"><div>No activity yet.</div><div style="margin-top:8px;font-size:13px">Create some notes, tasks, or events to populate your stream.</div></div>';return}let r=new Map;o.forEach(i=>{let s=Us(i.ts);r.has(s)||r.set(s,[]),r.get(s).push(i)}),v("#activity-stream").innerHTML=[...r.entries()].map(([i,s])=>`
    <div class="activity-day">
      <div class="dlabel">${c(i)}</div>
      <div class="activity-stream">
        ${s.map(l=>`
          <div class="act-item">
            <div class="act-icon">${l.icon}</div>
            <div class="act-body">
              ${l.text}
              <span class="when">${c(js(l.ts))}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join(""),v("#activity-stream").querySelectorAll("[data-go]").forEach(i=>{i.addEventListener("click",()=>t.switchApp(i.dataset.go))})}function Us(e){let t=new Date(e),n=new Date,a=(i,s)=>i.toDateString()===s.toDateString();if(a(t,n))return"Today";let o=new Date(n.getTime()-864e5);if(a(t,o))return"Yesterday";let r=Math.floor((n-t)/864e5);return r>0&&r<7?`${r} days ago`:r<0?t.toLocaleDateString("en-GB",{day:"numeric",month:"long"}):t.toLocaleDateString("en-GB",{day:"numeric",month:"long"})}function js(e){let t=new Date(e);return isNaN(t.getTime())?"":t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}var Fs,so=S(()=>{D();M();Fs={id:"activity",name:"Activity",icon:y.activity,hasSidebar:!1}});var Tn={};N(Tn,{meta:()=>Bs,render:()=>Ws});async function Ws(e,t){U(e,t,"Bookmarks discovers bookmark:Bookmark instances via your TypeIndex.")||(e.innerHTML=`<div class="content"><div class="page-pad" id="bm-page">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <h1 style="margin:0">Bookmarks</h1>
      <span id="bm-count" style="color:var(--text-faint);font:12px var(--mono)"></span>
      <button class="btn primary" id="bm-new" style="margin-left:auto">${y.plus} New</button>
    </div>
    <div id="bm-body"><div class="spinner"></div></div>
  </div></div>`,v("#bm-new").addEventListener("click",()=>co(t)),await zt(t))}async function zt(e){let t=v("#bm-body"),n=v("#bm-count");Ne=[];let a;try{a=await I(e.auth.id)}catch(r){t.innerHTML=`<div class="card" style="color:var(--text-dim)">
      <div style="color:var(--danger);margin-bottom:8px"><strong>Couldn't read your TypeIndex.</strong></div>
      <div style="font-size:13px">${c(r.message)}</div>
    </div>`;return}let o=a.registrations.filter(r=>ye.includes(r.forClass)&&r.instanceContainer);if(!o.length){t.innerHTML=`<div class="card" style="color:var(--text-dim);text-align:center;padding:32px 24px;max-width:640px;margin:0 auto">
      <div style="font-size:15px;color:var(--text);margin-bottom:6px">No bookmark collection yet.</div>
      <div style="font-size:13px;margin-bottom:18px">Hub will create <code>/hub/bookmarks/</code> on your pod and register it as a <code>bookmark:Bookmark</code> instance container in your TypeIndex.</div>
      <button class="btn primary" id="bm-empty-new">${y.plus} Create your first bookmark</button>
    </div>`,v("#bm-empty-new").addEventListener("click",()=>co(e)),n.textContent="";return}for(let r of o)try{let i=await F(r.instanceContainer),s=await Promise.all(i.filter(l=>l.type==="resource"&&/\.jsonld$/.test(l.url)).map(async l=>{try{let p=await L(l.url);return p?{url:l.url+"#this",doc:p}:null}catch{return null}}));for(let l of s.filter(Boolean))Ne.push(l)}catch{}Ne.sort((r,i)=>{let s=r.doc["dcterms:created"]||r.doc["dc:date"]||"";return(i.doc["dcterms:created"]||i.doc["dc:date"]||"").localeCompare(s)}),n.textContent=Ne.length===0?"":`${Ne.length} saved`,lo(e)}function lo(e){let t=v("#bm-body");if(!Ne.length){t.innerHTML='<div style="padding:32px 24px;text-align:center;color:var(--text-faint);font-size:13px">No bookmarks yet \u2014 click + New to add one.</div>';return}t.innerHTML='<div id="bm-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px"></div>';let n=v("#bm-grid");for(let a of Ne){let o=Ht(a.doc,["dc:title","title","schema:name","name"])||"Untitled",r=Js(Ht(a.doc,["bookmark:recalls","recalls"]))||"",i=Ht(a.doc,["dc:description","description"])||"",s=Ht(a.doc,["dcterms:created","dc:date","created","schema:dateCreated"]),l=document.createElement("div");l.style.cssText="background:var(--bg-elev);border:1px solid var(--line);border-radius:10px;padding:14px;cursor:pointer;transition:border-color .12s,transform .12s",l.innerHTML=`
      <div style="font-weight:600;font-size:14px;margin-bottom:4px">\u{1F516} ${c(o)}</div>
      ${r?`<div style="font-size:11px;color:var(--accent);font-family:var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:6px">${c(r)}</div>`:""}
      ${i?`<div style="font-size:12px;color:var(--text-dim);line-height:1.4;margin-bottom:6px">${c(i.slice(0,140))}${i.length>140?"\u2026":""}</div>`:""}
      ${s?`<div style="font-size:11px;color:var(--text-faint);font-family:var(--mono)">${c(oe(s))}</div>`:""}
    `,l.addEventListener("mouseover",()=>{l.style.borderColor="var(--accent)",l.style.transform="translateY(-1px)"}),l.addEventListener("mouseout",()=>{l.style.borderColor="var(--line)",l.style.transform=""}),l.addEventListener("click",()=>qs(a,e)),n.appendChild(l)}}function qs(e,t){let n=v("#bm-body");n.innerHTML=`
    <button class="btn" id="bm-back" style="margin-bottom:12px">\u2190 Back to list</button>
    <div id="bm-detail"></div>
  `,v("#bm-back").addEventListener("click",()=>lo(t));let a=v("#bm-detail"),o={url:e.url,doc:e.doc,forClass:ye[0]},r=O(o);if(!r){a.innerHTML='<div class="empty">No pane registered for bookmarks.</div>';return}r.render({...o,onChange:()=>zt(t),onDelete:()=>{x("Bookmark deleted","success"),zt(t)}},a,t)}async function co(e){let t=prompt("Bookmark URL:");if(!t)return;let n;try{n=new URL(t).href}catch{x("Not a valid URL","error");return}let a=prompt("Title (optional):","")||"";x("Creating bookmark\u2026");try{await Sa({webid:e.auth.id,title:a,url:n}),x("Bookmark added","success"),await zt(e)}catch(o){x("Create failed: "+o.message,"error")}}function Ht(e,t){for(let n of t)if(e?.[n]!==void 0)return e[n]}function Js(e){return typeof e=="string"?e:e&&typeof e=="object"&&e["@id"]?e["@id"]:null}var Ne,Bs,po=S(()=>{D();G();M();Ne=[],Bs={id:"bookmarks",name:"Bookmarks",icon:"\u{1F516}",hasSidebar:!1}});var Nn={};N(Nn,{meta:()=>Ks,render:()=>Gs});function Ys(e){let t;try{t=new URL(e).hostname}catch{return confirm(`Install this URL?

${e}

Apps get full DOM + xlogin access. Only install URLs you trust.`)}return Vs.has(t)?!0:confirm(`Install app from ${t}?

Apps have full access to your DOM and to your pod (via xlogin.authFetch).
Only install URLs you trust.`)}async function Gs(e,t){Qs(),e.innerHTML=`
    <div class="content"><div class="page-pad">
      <h1 style="margin:0 0 6px">Apps</h1>
      <p class="lede">Install, browse, and remove apps. Built-in apps ship with hub. External apps are ES modules loaded by URL on boot${t.auth.type==="solid"?" and persisted on your pod":""}.</p>

      <div class="store-section">
        <div class="store-section-head"><h2>Install by URL</h2></div>
        <div class="store-add">
          <select id="store-kind" title="App = rail-level UI \xB7 Pane = per-subject renderer">
            <option value="app">App</option>
            <option value="pane">Pane</option>
          </select>
          <input id="store-url" placeholder="https://example.org/my-app.js" />
          <button class="btn primary" id="store-install">Install</button>
        </div>
      </div>

      <div class="store-section">
        <div class="store-section-head">
          <h2>Installed</h2>
          <span id="store-count" class="store-meta"></span>
        </div>
        <div class="store-grid" id="store-installed"></div>
      </div>

      <div class="store-section">
        <div class="store-section-head">
          <h2>Suggested</h2>
          <span class="store-meta" id="store-directory-status">Loading directory\u2026</span>
        </div>
        <div class="store-grid" id="store-suggested"></div>
      </div>
    </div></div>
  `,Rt(t),v("#store-install").addEventListener("click",()=>fo(t)),v("#store-url").addEventListener("keydown",n=>{n.key==="Enter"&&(n.preventDefault(),fo(t))}),Xs(t)}async function fo(e){let t=v("#store-url"),n=t.value.trim();if(!n)return;let a=v("#store-kind")?.value||"app";await mo(n,e,a),t.value=""}async function mo(e,t,n="app"){if(!Ys(e))return;let a=new Set(_e()),o=new Set(_t());if(a.has(e)||o.has(e)){x("Already installed","info");return}x(n==="pane"?"Installing pane\u2026":"Installing app\u2026");try{if(n==="pane"){let r=await $t(e);x(`Installed pane ${r.meta?.name||r.meta?.id||e}`,"success")}else{let r=t.auth.type==="solid"?t.auth.id:null,i=await Qe(e,r);x(`Installed ${i.meta?.name||i.meta?.id||e} \u2014 reload to see it on the rail`,"success")}Rt(t),An(t)}catch(r){x("Install failed: "+r.message,"error")}}function Rt(e){let t=v("#store-installed"),n=v("#store-count");if(!t)return;let a=pe(),o=bt(),r=new Set(_e()),i=new Set(_t()),s=a.filter(h=>r.has(h.meta?.__externalUrl)).length,l=o.filter(h=>i.has(h.__externalUrl)).length,p=a.length-s,u=o.length-l,d=localStorage.getItem(In)==="1";n.textContent=`${p} built-in apps \xB7 ${s} external apps \xB7 ${u} built-in panes \xB7 ${l} external panes`;let f=a.map(h=>Pn({kind:"app",name:h.meta?.name||h.meta?.id,description:h.meta?.description,icon:h.meta?.icon,url:h.meta?.__externalUrl,isExternal:!!r.has(h.meta?.__externalUrl),isInstalled:!0})),m=o.filter(h=>i.has(h.__externalUrl)).map(h=>vo(h,!0)),g=o.filter(h=>!i.has(h.__externalUrl)).map(h=>vo(h,!1));t.innerHTML=`
    ${f.concat(m).join("")}
    ${g.length?`
      <div class="store-builtin-toggle-row">
        <button class="store-builtin-toggle" id="store-toggle-builtin-panes">
          ${d?"\u25BE":"\u25B8"} ${d?"Hide":"Show"} ${g.length} built-in pane${g.length===1?"":"s"}
        </button>
      </div>
      <div class="store-builtin-panes" id="store-builtin-panes" style="${d?"":"display:none"}">
        ${g.join("")}
      </div>
    `:""}
  `,T("[data-remove-url]",t).forEach(h=>h.addEventListener("click",async()=>{let k=h.dataset.removeUrl,w=h.dataset.removeKind;if(confirm(`Remove this ${w}?

${k}

It'll be gone after reload.`)){try{if(w==="pane")Wa(k);else{let E=e.auth.type==="solid"?e.auth.id:null;await Xe(k,E)}}catch(E){x("Remove failed: "+E.message,"error")}Rt(e),An(e),x("Removed \u2014 reload to apply","info")}})),v("#store-toggle-builtin-panes")?.addEventListener("click",()=>{let h=localStorage.getItem(In)!=="1";localStorage.setItem(In,h?"1":"0"),Rt(e)})}function vo(e,t){return Pn({kind:"pane",name:e.name||e.id,description:e.forClass?`Pane for ${e.forClass}`:Array.isArray(e.forClasses)?`Pane for ${e.forClasses.join(", ")}`:"Pane",icon:"\u{1F9E9}",url:e.__externalUrl,isExternal:t,isInstalled:!0})}async function Xs(e){let t=v("#store-directory-status");try{let n=await fetch(uo,{cache:"no-cache",headers:{Accept:"application/ld+json, application/json"}});if(!n.ok)throw new Error(`HTTP ${n.status}`);let a=await n.json(),o=a["schema:itemListElement"]??a.itemListElement??[];We=(Array.isArray(o)?o:[o]).map(i=>({url:i["@id"]||i["schema:identifier"],name:i["schema:name"]||i.name,description:i["schema:description"]||i.description,icon:i["schema:icon"]||i.icon,author:i["schema:author"]||i.author,kind:i["@type"]==="urn:Pane"?"pane":"app"})).filter(i=>i.url),t&&(t.textContent=`${We.length} curated \xB7 ${c(new URL(uo).hostname)}`)}catch(n){t&&(t.innerHTML=`<span style="color:var(--danger)">Couldn't load directory: ${c(n.message)}</span>`),We=[]}An(e)}function An(e){let t=v("#store-suggested");if(!t||!We)return;if(!We.length){t.innerHTML='<div class="store-empty">Directory is empty.</div>';return}let n=new Set(_e()),a=new Set(_t());t.innerHTML=We.map(o=>Pn({kind:o.kind,name:o.name,description:o.description,icon:o.icon,url:o.url,author:o.author,isExternal:!0,isInstalled:o.kind==="pane"?a.has(o.url):n.has(o.url)})).join(""),T("[data-install-url]",t).forEach(o=>o.addEventListener("click",()=>{mo(o.dataset.installUrl,e,o.dataset.installKind||"app")}))}function Pn(e){let t=e.kind||"app",n=t==="pane"?'<span class="store-kind-pane" title="Per-subject renderer (SLIP-48)">Pane</span>':'<span class="store-kind-app" title="Rail-level UI">App</span>',a=e.isInstalled?e.isExternal&&e.url?`<button class="btn danger" data-remove-url="${c(e.url)}" data-remove-kind="${t}" style="font-size:12px">Remove</button>`:'<span class="store-pill">Built-in</span>':`<button class="btn primary" data-install-url="${c(e.url)}" data-install-kind="${t}" style="font-size:12px">Install</button>`;return`
    <div class="store-card">
      <div class="store-card-icon">${e.icon||"\u{1F4E6}"}</div>
      <div class="store-card-body">
        <div class="store-card-name">${c(e.name||"(unnamed)")} ${n}</div>
        ${e.description?`<div class="store-card-desc">${c(e.description)}</div>`:""}
        ${e.author?`<div class="store-card-author">by ${c(e.author)}</div>`:""}
        ${e.url?`<div class="store-card-url" title="${c(e.url)}">${c(e.url)}</div>`:""}
      </div>
      <div class="store-card-action">${a}</div>
    </div>
  `}function Qs(){if(document.getElementById("store-app-css"))return;let e=document.createElement("style");e.id="store-app-css",e.textContent=`
.store-section { margin-top: 28px; }
.store-section-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
.store-section-head h2 { margin: 0; font-size: 16px; font-weight: 600; }
.store-meta { font-family: var(--mono); font-size: 12px; color: var(--text-faint); }
.store-add { display: flex; gap: 8px; align-items: stretch; }
.store-add select { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 9px; padding: 0 12px; font: inherit; font-size: 13px; color: var(--text); outline: none; }
.store-add input { flex: 1; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 9px; padding: 9px 12px; font-family: var(--mono); font-size: 13px; color: var(--text); outline: none; transition: border-color .12s, box-shadow .12s; }
.store-add input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.store-kind-app, .store-kind-pane { display: inline-block; padding: 1px 6px; border-radius: 4px; font: 500 10px var(--mono); margin-left: 4px; vertical-align: middle; }
.store-kind-app  { background: var(--accent-soft); color: var(--accent); }
.store-kind-pane { background: rgba(99,102,241,0.12); color: rgb(79,70,229); }
.store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.store-empty { color: var(--text-faint); font-size: 13px; padding: 24px; text-align: center; }

.store-card { display: flex; gap: 12px; padding: 14px; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 12px; transition: border-color .12s, transform .12s, box-shadow .12s; }
.store-card:hover { border-color: var(--accent); transform: translateY(-1px); box-shadow: var(--shadow); }
.store-card-icon { width: 40px; height: 40px; display: grid; place-items: center; background: var(--bg-elev-2); border-radius: 8px; font-size: 22px; flex-shrink: 0; }
.store-card-icon svg { width: 20px; height: 20px; color: var(--text); }
.store-card-body { flex: 1; min-width: 0; }
.store-card-name { font-weight: 600; font-size: 14px; }
.store-card-desc { font-size: 12px; color: var(--text-dim); margin-top: 2px; line-height: 1.4; }
.store-card-author { font-size: 11px; color: var(--text-faint); margin-top: 4px; font-family: var(--mono); }
.store-card-url { font-size: 11px; color: var(--text-faint); margin-top: 4px; font-family: var(--mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.store-card-action { display: flex; align-items: flex-start; flex-shrink: 0; }
.store-pill { display: inline-block; padding: 3px 8px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 6px; font-size: 11px; color: var(--text-faint); font-family: var(--mono); }
.store-builtin-toggle-row { grid-column: 1 / -1; padding: 4px 0; }
.store-builtin-toggle { background: transparent; border: none; color: var(--text-dim); cursor: pointer; font: 12px var(--mono); padding: 6px 10px; border-radius: 6px; transition: background .12s, color .12s; }
.store-builtin-toggle:hover { background: var(--bg-elev-2); color: var(--text); }
.store-builtin-panes { display: contents; }
`,document.head.appendChild(e)}var Ks,uo,Vs,In,We,go=S(()=>{M();et();G();Ks={id:"store",name:"Apps",icon:y.apps,hasSidebar:!1},uo="https://solid-apps.github.io/registry/index.json",Vs=new Set(["solid-apps.github.io","localhost","127.0.0.1"]);In="hubpod-store-show-builtin-panes";We=null});var zn={};N(zn,{meta:()=>el,render:()=>Dn});function ho(e,t="pane"){let n;try{n=new URL(e).hostname}catch{return confirm(`Load this URL?

${e}

Only proceed if you trust the source \u2014 ${t}s get full DOM + xlogin access.`)}return Zs.has(n)?!0:confirm(`Load and run code from ${n}?

${t==="app"?"Apps":"Panes"} have full access to your DOM and to your pod (via xlogin.authFetch).
Only load URLs you trust.`)}async function Dn(e,t){let n=null,a=null,o=null;if(t.auth.type==="solid"){n=await B(t.auth.id).catch(()=>null);try{a=await I(t.auth.id)}catch(i){o=i.message}}let r=document.documentElement.getAttribute("data-theme")||"light";e.innerHTML=`
    <div class="content"><div class="page-pad">
      <h1>Settings</h1>

      <div class="set-section">
        <h2>Appearance</h2>
        <div class="set-row">
          <div><div class="lbl">Theme</div><div class="desc">Light or dark.</div></div>
          <div class="toggle ${r==="dark"?"on":""}" id="theme-toggle"><div class="knob"></div></div>
        </div>
      </div>

      <div class="set-section">
        <h2>Panes</h2>
        <div class="set-row">
          <div>
            <div class="lbl">Use pilot's remote Tracker pane</div>
            <div class="desc">Off \u2192 use hub's <code>src/panes/tracker.js</code> (vendored from pilot, evolves independently here).<br/>On \u2192 load <a href="https://solid-apps.github.io/pilot/tracker-pane.js" target="_blank" style="color:var(--accent)">pilot's remote tracker-pane.js</a> at runtime instead. Useful for comparing hub's diverging copy against the upstream. Reload after toggling.</div>
          </div>
          <div class="toggle ${localStorage.getItem("hubpod-use-pilot-tracker")==="1"?"on":""}" id="pilot-toggle"><div class="knob"></div></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:10px">Registered panes</div>
          <div class="desc" style="margin-bottom:12px">Built-in panes are loaded at boot from <code>src/panes/</code>. External panes are loaded on demand via <code>urn:solid:view</code> on a TypeRegistration. First-match wins inside <code>findFor()</code>; <code>urn:solid:view</code> takes precedence over both via <code>resolveFor()</code>.</div>
          <div id="panes-registered-list" style="background:var(--bg-elev-2);padding:10px 14px;border-radius:8px;border:1px solid var(--line);font-family:var(--mono);font-size:12px;line-height:1.6"></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:10px">Default pane per class</div>
          <div class="desc" style="margin-bottom:12px">When two or more panes can render the same RDF class, pick which one wins. Stored in localStorage. Pinning to a pane that's not currently loaded falls through to the next match.</div>
          <div id="panes-defaults-list" style="display:flex;flex-direction:column;gap:8px"></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:10px">External panes loaded this session</div>
          <div id="panes-external-list" style="background:var(--bg-elev-2);padding:10px 14px;border-radius:8px;border:1px solid var(--line);font-family:var(--mono);font-size:12px;line-height:1.6;color:var(--text-dim)"></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:8px">Load a pane URL</div>
          <div class="desc" style="margin-bottom:10px">Manually pull in an ES module that exports <code>canHandle</code> + <code>render</code> (hub-style or LOSOS-style). It'll be added to the registry with priority over the built-ins.</div>
          <div style="display:flex;gap:8px">
            <input id="pane-load-url" placeholder="https://example.org/my-pane.js" style="flex:1;background:var(--bg-elev);border:1px solid var(--line);border-radius:8px;padding:8px 12px;font-family:var(--mono);font-size:13px;color:var(--text);outline:none" />
            <button class="btn primary" id="pane-load-btn">Load</button>
          </div>
        </div>

        ${t.auth.type==="solid"?`
          <div class="set-row" style="display:block">
            <div class="lbl" style="margin-bottom:8px">Pod sync (defaults)</div>
            <div class="desc" style="margin-bottom:10px">Pane defaults persist on your pod as <code>${c(ze)}</code> in your TypeIndex, so the same class \u2192 pane choices apply across browsers.</div>
            <div id="panes-pod-status" style="font-family:var(--mono);font-size:12px;color:var(--text-dim);margin-bottom:8px">Checking\u2026</div>
            <div style="display:flex;gap:8px">
              <button class="btn" id="panes-sync-to-pod-btn">Push localStorage \u2192 pod</button>
              <button class="btn" id="panes-sync-from-pod-btn">Pull pod \u2192 localStorage</button>
            </div>
          </div>
        `:""}
      </div>

      <div class="set-section">
        <h2>Apps</h2>
        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:10px">Installed apps</div>
          <div class="desc" style="margin-bottom:12px">Built-ins ship with hub. Externals are ES modules loaded by URL on boot \u2014 they appear on the rail alongside built-ins. Each must export <code>render(container, ctx)</code> and a <code>meta</code> object with at least <code>id</code>, <code>name</code>, <code>icon</code>.</div>
          <div id="apps-registered-list" style="background:var(--bg-elev-2);padding:10px 14px;border-radius:8px;border:1px solid var(--line);font-family:var(--mono);font-size:12px;line-height:1.6"></div>
        </div>

        <div class="set-row" style="display:block">
          <div class="lbl" style="margin-bottom:8px">Add an app by URL</div>
          <div class="desc" style="margin-bottom:10px">URL is saved in localStorage and (if signed in) written to your pod under <code>${c(Se)}</code>. Reload after adding to see it on the rail.</div>
          <div style="display:flex;gap:8px">
            <input id="app-load-url" placeholder="https://example.org/my-app.js" style="flex:1;background:var(--bg-elev);border:1px solid var(--line);border-radius:8px;padding:8px 12px;font-family:var(--mono);font-size:13px;color:var(--text);outline:none" />
            <button class="btn primary" id="app-load-btn">Add</button>
          </div>
        </div>

        ${t.auth.type==="solid"?`
          <div class="set-row" style="display:block">
            <div class="lbl" style="margin-bottom:8px">Pod sync</div>
            <div class="desc" style="margin-bottom:10px">Apps are persisted on your pod as a <code>schema:ItemList</code> doc registered with <code>forClass: ${c(Se)}</code> in your TypeIndex. Other browsers see the same list when they sign in.</div>
            <div id="apps-pod-status" style="font-family:var(--mono);font-size:12px;color:var(--text-dim);margin-bottom:8px">Checking\u2026</div>
            <div style="display:flex;gap:8px">
              <button class="btn" id="apps-sync-to-pod-btn">Push localStorage \u2192 pod</button>
              <button class="btn" id="apps-sync-from-pod-btn">Pull pod \u2192 localStorage</button>
            </div>
          </div>
        `:""}
      </div>

      <div class="set-section">
        <h2>Identity</h2>
        ${t.auth.loggedIn?`
          <div class="set-row">
            <div>
              <div class="lbl">Signed in as</div>
              <div class="desc">${c(t.auth.type)} session</div>
            </div>
            <div class="val">${c(t.auth.id)}</div>
          </div>
          <div class="set-row">
            <div>
              <div class="lbl">Pod storage</div>
              <div class="desc">Discovered from your WebID's <code>pim:storage</code>, or origin fallback.</div>
            </div>
            <div class="val">${c(n||"(unknown)")}</div>
          </div>
          <div class="set-row">
            <div>
              <div class="lbl">hub-pod root</div>
              <div class="desc">Where this app stores its data on your pod.</div>
            </div>
            <div class="val">${c(Te(n)||"(none)")}</div>
          </div>
          <div class="set-row">
            <div><div class="lbl">Sign out</div><div class="desc">Clear the local session.</div></div>
            <button class="btn danger" id="logout-btn">Logout</button>
          </div>
        `:`
          <div class="set-row">
            <div><div class="lbl">Not signed in</div><div class="desc">Click the floating Login button (bottom-right) to sign in via xlogin.</div></div>
          </div>
        `}
      </div>

      ${t.auth.type==="solid"?`
        <div class="set-section">
          <h2>TypeIndex</h2>
          ${a?`
            <div class="set-row">
              <div><div class="lbl">Public TypeIndex</div><div class="desc">Where apps discover where your data lives.</div></div>
              <div class="val">${c(a.typeIndexUrl)}</div>
            </div>
            <div class="set-row">
              <div><div class="lbl">Registrations</div><div class="desc">${a.registrations.length} total, ${ut(a,J).length} for wf:Tracker.</div></div>
              <div class="val">${a.registrations.length}</div>
            </div>
            ${a.registrations.length?`
              <div class="set-row" style="display:block">
                <div class="lbl" style="margin-bottom:8px">All registrations</div>
                <div style="background:var(--bg-elev-2);padding:10px 14px;border-radius:8px;border:1px solid var(--line);font-family:var(--mono);font-size:12px;line-height:1.6;color:var(--text-dim);max-height:280px;overflow-y:auto">
                  ${a.registrations.map(i=>`
                    <div style="padding:6px 0;border-bottom:1px solid var(--line)">
                      <div><span style="color:var(--text-faint)">forClass:</span> ${c(i.forClass)}</div>
                      ${i.instance?`<div style="word-break:break-all"><span style="color:var(--text-faint)">instance:</span> ${c(i.instance)}</div>`:""}
                      ${i.instanceContainer?`<div style="word-break:break-all"><span style="color:var(--text-faint)">instanceContainer:</span> ${c(i.instanceContainer)}</div>`:""}
                      ${i.view?`<div style="word-break:break-all;color:var(--accent)"><span style="color:var(--text-faint)">urn:solid:view:</span> ${c(i.view)}</div>`:""}
                    </div>
                  `).join("")}
                </div>
              </div>
            `:""}
          `:`
            <div class="set-row">
              <div>
                <div class="lbl" style="color:var(--danger)">TypeIndex not available</div>
                <div class="desc">${c(o||"")}</div>
              </div>
            </div>
          `}
        </div>
      `:""}

      <div class="set-section">
        <h2>Discovery</h2>
        <div class="set-row" style="display:block">
          <div class="desc" style="margin-bottom:10px">Hub doesn't hardcode paths \u2014 every app reads from the registrations in your <code>solid:publicTypeIndex</code>. Add a <code>solid:TypeRegistration</code> with one of these <code>forClass</code> values to surface a container or document.</div>
        </div>
        <div class="set-row"><div><div class="lbl">Notes</div><div class="desc">${c(ne.join(", "))}</div></div></div>
        <div class="set-row"><div><div class="lbl">Tasks</div><div class="desc">${c(J)} (SolidOS shape #1 \u2014 embedded issue array)</div></div></div>
        <div class="set-row"><div><div class="lbl">Calendar</div><div class="desc">${c(ae.join(", "))}</div></div></div>
        <div class="set-row"><div><div class="lbl">Photos</div><div class="desc">${c(be.join(", "))}</div></div></div>
      </div>

      <div class="set-section">
        <h2>About</h2>
        <div class="set-row">
          <div><div class="lbl">hub-pod</div><div class="desc">Hub UI wired to a Solid pod via xlogin + JSON-LD CRUD. AGPL-3.0.</div></div>
        </div>
      </div>
    </div></div>
  `,v("#theme-toggle")?.addEventListener("click",()=>{let s=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",s),localStorage.setItem("hubpod-theme",s),Dn(e,t)}),v("#pilot-toggle")?.addEventListener("click",()=>{let i=localStorage.getItem("hubpod-use-pilot-tracker")==="1";i?localStorage.removeItem("hubpod-use-pilot-tracker"):localStorage.setItem("hubpod-use-pilot-tracker","1"),confirm((i?"Disabling":"Enabling")+" pilot's Tracker pane requires a reload. Reload now?")?window.location.reload():Dn(e,t)}),Mn(t),Ot(t),v("#pane-load-btn")?.addEventListener("click",async()=>{let i=v("#pane-load-url")?.value.trim();if(!i||!ho(i,"pane"))return;let s=v("#pane-load-btn");s.disabled=!0,s.textContent="Loading\u2026";try{let l=await $t(i);x(`Loaded ${l.meta?.name||l.meta?.id||i}`,"success"),v("#pane-load-url").value="",Mn(t)}catch(l){x("Load failed: "+l.message,"error")}finally{s.disabled=!1,s.textContent="Load"}}),Hn(t),it(t),v("#app-load-btn")?.addEventListener("click",async()=>{let i=v("#app-load-url")?.value.trim();if(!i||!ho(i,"app"))return;let s=v("#app-load-btn");s.disabled=!0,s.textContent="Adding\u2026";try{let l=t.auth.type==="solid"?t.auth.id:null,p=await Qe(i,l);x(`Added ${p.meta?.name||p.meta?.id||i} \u2014 reload to see it on the rail`,"success"),v("#app-load-url").value="",Hn(t),it(t)}catch(l){x("Add failed: "+l.message,"error")}finally{s.disabled=!1,s.textContent="Add"}}),v("#apps-sync-to-pod-btn")?.addEventListener("click",async()=>{let i=v("#apps-sync-to-pod-btn");i.disabled=!0,i.textContent="Pushing\u2026";try{await dn(t.auth.id),x("Pushed apps list to pod","success"),it(t)}catch(s){x("Push failed: "+s.message,"error")}finally{i.disabled=!1,i.textContent="Push localStorage \u2192 pod"}}),v("#panes-sync-to-pod-btn")?.addEventListener("click",async()=>{let i=v("#panes-sync-to-pod-btn");i.disabled=!0,i.textContent="Pushing\u2026";try{await Ua(t.auth.id),x("Pushed pane defaults to pod","success"),Ot(t)}catch(s){x("Push failed: "+s.message,"error")}finally{i.disabled=!1,i.textContent="Push localStorage \u2192 pod"}}),v("#panes-sync-from-pod-btn")?.addEventListener("click",async()=>{let i=v("#panes-sync-from-pod-btn");i.disabled=!0,i.textContent="Pulling\u2026";try{let s=await yt(t.auth.id);s.source==="none"?x("No pane-defaults registration found on this pod","info"):s.changed?(x(`Pulled ${Object.keys(s.defaults).length} default${Object.keys(s.defaults).length===1?"":"s"} from pod`,"success"),Mn(t)):x("Already in sync","success"),Ot(t)}catch(s){x("Pull failed: "+s.message,"error")}finally{i.disabled=!1,i.textContent="Pull pod \u2192 localStorage"}}),v("#apps-sync-from-pod-btn")?.addEventListener("click",async()=>{let i=v("#apps-sync-from-pod-btn");i.disabled=!0,i.textContent="Pulling\u2026";try{let s=await Ze(t.auth.id);s.source==="none"?x("No apps registration found on this pod","info"):s.changed?confirm(`Pulled ${s.items.length} app${s.items.length===1?"":"s"} from pod. Reload to apply?`)&&window.location.reload():x("Already in sync","success"),it(t)}catch(s){x("Pull failed: "+s.message,"error")}finally{i.disabled=!1,i.textContent="Pull pod \u2192 localStorage"}}),v("#logout-btn")?.addEventListener("click",()=>ba())}async function it(e){let t=v("#apps-pod-status");if(!(!t||e.auth.type!=="solid")){t.textContent="Checking\u2026";try{let n=await ft(e.auth.id);if(!n){t.innerHTML=`<span style="color:var(--text-faint)">No <code>${c(Se)}</code> registration on pod yet \u2014 push to create it.</span>`;return}let a=_e(),o=a.length===n.items.length&&a.every((r,i)=>r===n.items[i]);t.innerHTML=`<div style="color:var(--good)">\u2713 Pod has ${n.items.length} app${n.items.length===1?"":"s"} at <code style="word-break:break-all">${c(n.url)}</code></div>`+(o?'<div style="color:var(--text-faint);margin-top:4px">In sync with localStorage.</div>':`<div style="color:var(--warning);margin-top:4px">Differs from localStorage (${a.length} cached).</div>`)}catch(n){t.innerHTML=`<span style="color:var(--danger)">Couldn't check pod: ${c(n.message)}</span>`}}}async function Ot(e){let t=v("#panes-pod-status");if(!(!t||e.auth.type!=="solid")){t.textContent="Checking\u2026";try{let n=await mt(e.auth.id);if(!n){t.innerHTML=`<span style="color:var(--text-faint)">No <code>${c(ze)}</code> registration on pod yet \u2014 push to create it.</span>`;return}let a=un(),o=JSON.stringify(a)===JSON.stringify(n.defaults),r=Object.keys(n.defaults).length;t.innerHTML=`<div style="color:var(--good)">\u2713 Pod has ${r} default${r===1?"":"s"} at <code style="word-break:break-all">${c(n.url)}</code></div>`+(o?'<div style="color:var(--text-faint);margin-top:4px">In sync with localStorage.</div>':`<div style="color:var(--warning);margin-top:4px">Differs from localStorage (${Object.keys(a).length} cached).</div>`)}catch(n){t.innerHTML=`<span style="color:var(--danger)">Couldn't check pod: ${c(n.message)}</span>`}}}function Mn(e){let t=bt(),n=v("#panes-registered-list");n&&(n.innerHTML=t.length===0?'<div style="color:var(--text-faint)">No panes registered.</div>':t.map((s,l)=>`
          <div style="padding:6px 0;${l>0?"border-top:1px solid var(--line);":""}">
            <div style="color:var(--text);font-weight:600">${c(s.name||s.id||"(unnamed)")}</div>
            <div style="color:var(--text-faint);word-break:break-all">id: ${c(s.id||"\u2014")}</div>
            ${s.forClass?`<div style="color:var(--text-faint);word-break:break-all">forClass: ${c(s.forClass)}</div>`:""}
            ${Array.isArray(s.forClasses)?`<div style="color:var(--text-faint);word-break:break-all">forClasses: ${c(s.forClasses.join(", "))}</div>`:""}
          </div>
        `).join(""));let a=new Map;for(let s of t){let l=[];typeof s.forClass=="string"&&l.push(s.forClass),Array.isArray(s.forClasses)&&l.push(...s.forClasses);for(let p of l)a.has(p)||a.set(p,[]),a.get(p).push(s)}let o=un(),r=v("#panes-defaults-list");if(r){let s=[...a.entries()].filter(([,l])=>l.length>1);s.length===0?r.innerHTML='<div style="color:var(--text-faint);font-size:13px">All classes currently have one pane each. Load another (URL box below, or via <code>urn:solid:view</code>) to enable picking.</div>':(r.innerHTML=s.map(([l,p])=>`
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <code style="font-size:12px;color:var(--text-dim);word-break:break-all;flex:1;min-width:200px">${c(l)}</code>
          <select data-default-class="${c(l)}" style="background:var(--bg-elev-2);border:1px solid var(--line);border-radius:8px;padding:6px 10px;font:inherit;font-size:13px;color:var(--text)">
            <option value="">auto \xB7 ${c(p[0].name||p[0].id)}</option>
            ${p.map(u=>`<option value="${c(u.id)}" ${o[l]===u.id?"selected":""}>${c(u.name||u.id)}</option>`).join("")}
          </select>
        </div>
      `).join(""),T("[data-default-class]",r).forEach(l=>l.addEventListener("change",async()=>{let p=e?.auth?.type==="solid"?e.auth.id:null;try{await Oa(l.dataset.defaultClass,l.value||null,p)}catch(u){x("Save default failed: "+u.message,"error")}p&&Ot(e)})))}let i=v("#panes-external-list");if(i){let s=ja();s.length===0?i.innerHTML="<span>None yet \u2014 set <code>urn:solid:view</code> on a TypeRegistration, or use the load box below.</span>":i.innerHTML=s.map((l,p)=>`
        <div style="padding:6px 0;${p>0?"border-top:1px solid var(--line);":""};color:var(--text-dim)">
          <div style="word-break:break-all;color:${l.loaded?"var(--good)":"var(--danger)"}">${l.loaded?"\u2713":"\u2717"} ${c(l.url)}</div>
          ${l.meta?.name?`<div style="color:var(--text-faint)">name: ${c(l.meta.name)}</div>`:""}
        </div>
      `).join("")}}function Hn(e){let t=v("#apps-registered-list");if(!t)return;let n=pe(),a=new Set(_e());if(!n.length){t.innerHTML='<div style="color:var(--text-faint)">No apps registered.</div>';return}t.innerHTML=n.map((o,r)=>{let i=o.meta?.__externalUrl,s=!!i&&a.has(i);return`
      <div style="padding:8px 0;${r>0?"border-top:1px solid var(--line);":""};display:flex;align-items:center;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="color:var(--text);font-weight:600">${c(o.meta.name||o.meta.id||"(unnamed)")} ${s?'<span style="color:var(--text-faint);font-weight:400;font-size:11px">\xB7 external</span>':'<span style="color:var(--text-faint);font-weight:400;font-size:11px">\xB7 built-in</span>'}</div>
          <div style="color:var(--text-faint);word-break:break-all">id: ${c(o.meta.id||"\u2014")}</div>
          ${i?`<div style="color:var(--text-faint);word-break:break-all">${c(i)}</div>`:""}
        </div>
        ${s?`<button class="btn danger" data-app-remove="${c(i)}" style="font-size:12px;padding:4px 10px">Remove</button>`:""}
      </div>
    `}).join(""),T("[data-app-remove]",t).forEach(o=>o.addEventListener("click",async()=>{let r=o.dataset.appRemove;if(!confirm(`Remove this app?

${r}

It'll disappear from the rail on next reload.`))return;let i=e?.auth?.type==="solid"?e.auth.id:null;try{await Xe(r,i)}catch(s){x("Remove from pod failed: "+s.message,"error")}Hn(e),it(e),x("App removed \u2014 reload to update the rail","info")}))}var Zs,el,xo=S(()=>{D();pt();M();G();et();Zs=new Set(["solid-apps.github.io","localhost","127.0.0.1"]);el={id:"settings",name:"Settings",icon:y.settings,hasSidebar:!1}});function Ce(e,t){for(var n in t)e[n]=t[n];return e}function Eo(e){var t=e.parentNode;t&&t.removeChild(e)}function qt(e,t,n){var a,o,r,i={};for(r in t)r=="key"?a=t[r]:r=="ref"?o=t[r]:i[r]=t[r];if(arguments.length>2&&(i.children=arguments.length>3?Wt.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(r in e.defaultProps)i[r]===void 0&&(i[r]=e.defaultProps[r]);return jt(e,i,a,o,null)}function jt(e,t,n,a,o){var r={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,constructor:void 0,__v:o??++$o,__i:-1,__u:0};return o==null&&C.vnode!=null&&C.vnode(r),r}function Jt(e){return e.children}function Ft(e,t){this.props=e,this.context=t}function qe(e,t){if(t==null)return e.__?qe(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?qe(e):null}function So(e){var t,n;if((e=e.__)!=null&&e.__c!=null){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null){e.__e=e.__c.base=n.__e;break}return So(e)}}function bo(e){(!e.__d&&(e.__d=!0)&&Me.push(e)&&!Bt.__r++||yo!==C.debounceRendering)&&((yo=C.debounceRendering)||Co)(Bt)}function Bt(){var e,t,n,a,o,r,i,s,l;for(Me.sort(Rn);e=Me.shift();)e.__d&&(t=Me.length,a=void 0,r=(o=(n=e).__v).__e,s=[],l=[],(i=n.__P)&&((a=Ce({},o)).__v=o.__v+1,jn(i,a,o,n.__n,i.ownerSVGElement!==void 0,32&o.__u?[r]:null,s,r??qe(o),!!(32&o.__u),l),a.__.__k[a.__i]=a,Ao(s,a,l),a.__e!=r&&So(a)),Me.length>t&&Me.sort(Rn));Bt.__r=0}function To(e,t,n,a,o,r,i,s,l,p,u){var d,f,m,g,h,k=a&&a.__k||Lo,w=t.length;for(n.__d=l,ol(n,t,k),l=n.__d,d=0;d<w;d++)(m=n.__k[d])!=null&&typeof m!="boolean"&&typeof m!="function"&&(f=m.__i===-1?st:k[m.__i]||st,m.__i=d,jn(e,m,f,o,r,i,s,l,p,u),g=m.__e,m.ref&&f.ref!=m.ref&&(f.ref&&Fn(f.ref,null,m),u.push(m.ref,m.__c||g,m)),h==null&&g!=null&&(h=g),65536&m.__u||f.__k===m.__k?l=Io(m,l,e):typeof m.type=="function"&&m.__d!==void 0?l=m.__d:g&&(l=g.nextSibling),m.__d=void 0,m.__u&=-196609);n.__d=l,n.__e=h}function ol(e,t,n){var a,o,r,i,s,l=t.length,p=n.length,u=p,d=0;for(e.__k=[],a=0;a<l;a++)(o=e.__k[a]=(o=t[a])==null||typeof o=="boolean"||typeof o=="function"?null:typeof o=="string"||typeof o=="number"||typeof o=="bigint"||o.constructor==String?jt(null,o,null,null,o):Un(o)?jt(Jt,{children:o},null,null,null):o.__b>0?jt(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):o)!=null?(o.__=e,o.__b=e.__b+1,s=rl(o,n,i=a+d,u),o.__i=s,r=null,s!==-1&&(u--,(r=n[s])&&(r.__u|=131072)),r==null||r.__v===null?(s==-1&&d--,typeof o.type!="function"&&(o.__u|=65536)):s!==i&&(s===i+1?d++:s>i?u>l-i?d+=s-i:d--:d=s<i&&s==i-1?s-i:0,s!==a+d&&(o.__u|=65536))):(r=n[a])&&r.key==null&&r.__e&&(r.__e==e.__d&&(e.__d=qe(r)),On(r,r,!1),n[a]=null,u--);if(u)for(a=0;a<p;a++)(r=n[a])!=null&&(131072&r.__u)==0&&(r.__e==e.__d&&(e.__d=qe(r)),On(r,r))}function Io(e,t,n){var a,o;if(typeof e.type=="function"){for(a=e.__k,o=0;a&&o<a.length;o++)a[o]&&(a[o].__=e,t=Io(a[o],t,n));return t}return e.__e!=t&&(n.insertBefore(e.__e,t||null),t=e.__e),t&&t.nextSibling}function rl(e,t,n,a){var o=e.key,r=e.type,i=n-1,s=n+1,l=t[n];if(l===null||l&&o==l.key&&r===l.type)return n;if(a>(l!=null&&(131072&l.__u)==0?1:0))for(;i>=0||s<t.length;){if(i>=0){if((l=t[i])&&(131072&l.__u)==0&&o==l.key&&r===l.type)return i;i--}if(s<t.length){if((l=t[s])&&(131072&l.__u)==0&&o==l.key&&r===l.type)return s;s++}}return-1}function wo(e,t,n){t[0]==="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||al.test(t)?n:n+"px"}function Ut(e,t,n,a,o){var r;e:if(t==="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||wo(e.style,t,"");if(n)for(t in n)a&&n[t]===a[t]||wo(e.style,t,n[t])}else if(t[0]==="o"&&t[1]==="n")r=t!==(t=t.replace(/(PointerCapture)$|Capture$/,"$1")),t=t.toLowerCase()in e?t.toLowerCase().slice(2):t.slice(2),e.l||(e.l={}),e.l[t+r]=n,n?a?n.u=a.u:(n.u=Date.now(),e.addEventListener(t,r?_o:ko,r)):e.removeEventListener(t,r?_o:ko,r);else{if(o)t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!=="width"&&t!=="height"&&t!=="href"&&t!=="list"&&t!=="form"&&t!=="tabIndex"&&t!=="download"&&t!=="rowSpan"&&t!=="colSpan"&&t!=="role"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!=="-"?e.removeAttribute(t):e.setAttribute(t,n))}}function ko(e){var t=this.l[e.type+!1];if(e.t){if(e.t<=t.u)return}else e.t=Date.now();return t(C.event?C.event(e):e)}function _o(e){return this.l[e.type+!0](C.event?C.event(e):e)}function jn(e,t,n,a,o,r,i,s,l,p){var u,d,f,m,g,h,k,w,E,W,Z,q,_,$,A,P=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(l=!!(32&n.__u),r=[s=t.__e=n.__e]),(u=C.__b)&&u(t);e:if(typeof P=="function")try{if(w=t.props,E=(u=P.contextType)&&a[u.__c],W=u?E?E.props.value:u.__:a,n.__c?k=(d=t.__c=n.__c).__=d.__E:("prototype"in P&&P.prototype.render?t.__c=d=new P(w,W):(t.__c=d=new Ft(w,W),d.constructor=P,d.render=sl),E&&E.sub(d),d.props=w,d.state||(d.state={}),d.context=W,d.__n=a,f=d.__d=!0,d.__h=[],d._sb=[]),d.__s==null&&(d.__s=d.state),P.getDerivedStateFromProps!=null&&(d.__s==d.state&&(d.__s=Ce({},d.__s)),Ce(d.__s,P.getDerivedStateFromProps(w,d.__s))),m=d.props,g=d.state,d.__v=t,f)P.getDerivedStateFromProps==null&&d.componentWillMount!=null&&d.componentWillMount(),d.componentDidMount!=null&&d.__h.push(d.componentDidMount);else{if(P.getDerivedStateFromProps==null&&w!==m&&d.componentWillReceiveProps!=null&&d.componentWillReceiveProps(w,W),!d.__e&&(d.shouldComponentUpdate!=null&&d.shouldComponentUpdate(w,d.__s,W)===!1||t.__v===n.__v)){for(t.__v!==n.__v&&(d.props=w,d.state=d.__s,d.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.forEach(function(b){b&&(b.__=t)}),Z=0;Z<d._sb.length;Z++)d.__h.push(d._sb[Z]);d._sb=[],d.__h.length&&i.push(d);break e}d.componentWillUpdate!=null&&d.componentWillUpdate(w,d.__s,W),d.componentDidUpdate!=null&&d.__h.push(function(){d.componentDidUpdate(m,g,h)})}if(d.context=W,d.props=w,d.__P=e,d.__e=!1,q=C.__r,_=0,"prototype"in P&&P.prototype.render){for(d.state=d.__s,d.__d=!1,q&&q(t),u=d.render(d.props,d.state,d.context),$=0;$<d._sb.length;$++)d.__h.push(d._sb[$]);d._sb=[]}else do d.__d=!1,q&&q(t),u=d.render(d.props,d.state,d.context),d.state=d.__s;while(d.__d&&++_<25);d.state=d.__s,d.getChildContext!=null&&(a=Ce(Ce({},a),d.getChildContext())),f||d.getSnapshotBeforeUpdate==null||(h=d.getSnapshotBeforeUpdate(m,g)),To(e,Un(A=u!=null&&u.type===Jt&&u.key==null?u.props.children:u)?A:[A],t,n,a,o,r,i,s,l,p),d.base=t.__e,t.__u&=-161,d.__h.length&&i.push(d),k&&(d.__E=d.__=null)}catch(b){t.__v=null,l||r!=null?(t.__e=s,t.__u|=l?160:32,r[r.indexOf(s)]=null):(t.__e=n.__e,t.__k=n.__k),C.__e(b,t,n)}else r==null&&t.__v===n.__v?(t.__k=n.__k,t.__e=n.__e):t.__e=il(n.__e,t,n,a,o,r,i,l,p);(u=C.diffed)&&u(t)}function Ao(e,t,n){t.__d=void 0;for(var a=0;a<n.length;a++)Fn(n[a],n[++a],n[++a]);C.__c&&C.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(r){r.call(o)})}catch(r){C.__e(r,o.__v)}})}function il(e,t,n,a,o,r,i,s,l){var p,u,d,f,m,g,h,k=n.props,w=t.props,E=t.type;if(E==="svg"&&(o=!0),r!=null){for(p=0;p<r.length;p++)if((m=r[p])&&"setAttribute"in m==!!E&&(E?m.localName===E:m.nodeType===3)){e=m,r[p]=null;break}}if(e==null){if(E===null)return document.createTextNode(w);e=o?document.createElementNS("http://www.w3.org/2000/svg",E):document.createElement(E,w.is&&w),r=null,s=!1}if(E===null)k===w||s&&e.data===w||(e.data=w);else{if(r=r&&Wt.call(e.childNodes),k=n.props||st,!s&&r!=null)for(k={},p=0;p<e.attributes.length;p++)k[(m=e.attributes[p]).name]=m.value;for(p in k)m=k[p],p=="children"||(p=="dangerouslySetInnerHTML"?d=m:p==="key"||p in w||Ut(e,p,null,m,o));for(p in w)m=w[p],p=="children"?f=m:p=="dangerouslySetInnerHTML"?u=m:p=="value"?g=m:p=="checked"?h=m:p==="key"||s&&typeof m!="function"||k[p]===m||Ut(e,p,m,k[p],o);if(u)s||d&&(u.__html===d.__html||u.__html===e.innerHTML)||(e.innerHTML=u.__html),t.__k=[];else if(d&&(e.innerHTML=""),To(e,Un(f)?f:[f],t,n,a,o&&E!=="foreignObject",r,i,r?r[0]:n.__k&&qe(n,0),s,l),r!=null)for(p=r.length;p--;)r[p]!=null&&Eo(r[p]);s||(p="value",g!==void 0&&(g!==e[p]||E==="progress"&&!g||E==="option"&&g!==k[p])&&Ut(e,p,g,k[p],!1),p="checked",h!==void 0&&h!==e[p]&&Ut(e,p,h,k[p],!1))}return e}function Fn(e,t,n){try{typeof e=="function"?e(t):e.current=t}catch(a){C.__e(a,n)}}function On(e,t,n){var a,o;if(C.unmount&&C.unmount(e),(a=e.ref)&&(a.current&&a.current!==e.__e||Fn(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(r){C.__e(r,t)}a.base=a.__P=null,e.__c=void 0}if(a=e.__k)for(o=0;o<a.length;o++)a[o]&&On(a[o],t,n||typeof e.type!="function");n||e.__e==null||Eo(e.__e),e.__=e.__e=e.__d=void 0}function sl(e,t,n){return this.constructor(e,n)}function Po(e,t,n){var a,o,r,i;C.__&&C.__(e,t),o=(a=typeof n=="function")?null:n&&n.__k||t.__k,r=[],i=[],jn(t,e=(!a&&n||t).__k=qt(Jt,null,[e]),o||st,st,t.ownerSVGElement!==void 0,!a&&n?[n]:o?null:t.firstChild?Wt.call(t.childNodes):null,r,!a&&n?n:o?o.__e:t.firstChild,a,i),Ao(r,e,i)}var Wt,C,$o,tl,Me,yo,Co,Rn,nl,st,Lo,al,Un,Bn=S(()=>{st={},Lo=[],al=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Un=Array.isArray;Wt=Lo.slice,C={__e:function(e,t,n,a){for(var o,r,i;t=t.__;)if((o=t.__c)&&!o.__)try{if((r=o.constructor)&&r.getDerivedStateFromError!=null&&(o.setState(r.getDerivedStateFromError(e)),i=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,a||{}),i=o.__d),i)return o.__E=o}catch(s){e=s}throw e}},$o=0,tl=function(e){return e!=null&&e.constructor==null},Ft.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=Ce({},this.state),typeof e=="function"&&(e=e(Ce({},n),this.props)),e&&Ce(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),bo(this))},Ft.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),bo(this))},Ft.prototype.render=Jt,Me=[],Co=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Rn=function(e,t){return e.__v.__b-t.__v.__b},Bt.__r=0,nl=0});function Jn(e,t){C.__h&&C.__h(z,e,dt||t),dt=0;var n=z.__H||(z.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({__V:Kt}),n.__[e]}function ge(e){return dt=1,ll(Bo,e)}function ll(e,t,n){var a=Jn(lt++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):Bo(void 0,t),function(s){var l=a.__N?a.__N[0]:a.__[0],p=a.t(l,s);l!==p&&(a.__N=[p,a.__[1]],a.__c.setState({}))}],a.__c=z,!z.u)){var o=function(s,l,p){if(!a.__c.__H)return!0;var u=a.__c.__H.__.filter(function(f){return f.__c});if(u.every(function(f){return!f.__N}))return!r||r.call(this,s,l,p);var d=!1;return u.forEach(function(f){if(f.__N){var m=f.__[0];f.__=f.__N,f.__N=void 0,m!==f.__[0]&&(d=!0)}}),!(!d&&a.__c.props===s)&&(!r||r.call(this,s,l,p))};z.u=!0;var r=z.shouldComponentUpdate,i=z.componentWillUpdate;z.componentWillUpdate=function(s,l,p){if(this.__e){var u=r;r=void 0,o(s,l,p),r=u}i&&i.call(this,s,l,p)},z.shouldComponentUpdate=o}return a.__N||a.__}function Je(e,t){var n=Jn(lt++,3);!C.__s&&Fo(n.__H,t)&&(n.__=e,n.i=t,z.__H.__h.push(n))}function Yt(e){return dt=5,jo(function(){return{current:e}},[])}function jo(e,t){var n=Jn(lt++,7);return Fo(n.__H,t)?(n.__V=e(),n.i=t,n.__h=e,n.__V):n.__}function Kn(e,t){return dt=8,jo(function(){return e},t)}function dl(){for(var e;e=Uo.shift();)if(e.__P&&e.__H)try{e.__H.__h.forEach(Vt),e.__H.__h.forEach(qn),e.__H.__h=[]}catch(t){e.__H.__h=[],C.__e(t,e.__v)}}function cl(e){var t,n=function(){clearTimeout(a),Oo&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,100);Oo&&(t=requestAnimationFrame(n))}function Vt(e){var t=z,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),z=t}function qn(e){var t=z;e.__c=e.__(),z=t}function Fo(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function Bo(e,t){return typeof t=="function"?t(e):t}var lt,z,Wn,No,dt,Uo,Kt,Mo,Do,Ho,zo,Ro,Oo,Wo=S(()=>{Bn();dt=0,Uo=[],Kt=[],Mo=C.__b,Do=C.__r,Ho=C.diffed,zo=C.__c,Ro=C.unmount;C.__b=function(e){z=null,Mo&&Mo(e)},C.__r=function(e){Do&&Do(e),lt=0;var t=(z=e.__c).__H;t&&(Wn===z?(t.__h=[],z.__h=[],t.__.forEach(function(n){n.__N&&(n.__=n.__N),n.__V=Kt,n.__N=n.i=void 0})):(t.__h.forEach(Vt),t.__h.forEach(qn),t.__h=[],lt=0)),Wn=z},C.diffed=function(e){Ho&&Ho(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(Uo.push(t)!==1&&No===C.requestAnimationFrame||((No=C.requestAnimationFrame)||cl)(dl)),t.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.__V!==Kt&&(n.__=n.__V),n.i=void 0,n.__V=Kt})),Wn=z=null},C.__c=function(e,t){t.some(function(n){try{n.__h.forEach(Vt),n.__h=n.__h.filter(function(a){return!a.__||qn(a)})}catch(a){t.some(function(o){o.__h&&(o.__h=[])}),t=[],C.__e(a,n.__v)}}),zo&&zo(e,t)},C.unmount=function(e){Ro&&Ro(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.forEach(function(a){try{Vt(a)}catch(o){t=o}}),n.__H=void 0,t&&C.__e(t,n.__v))};Oo=typeof requestAnimationFrame=="function"});function Ko(e){var t=qo.get(this);return t||(t=new Map,qo.set(this,t)),(t=Jo(this,t.get(e)||(t.set(e,t=(function(n){for(var a,o,r=1,i="",s="",l=[0],p=function(f){r===1&&(f||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?l.push(0,f,i):r===3&&(f||i)?(l.push(3,f,i),r=2):r===2&&i==="..."&&f?l.push(4,f,0):r===2&&i&&!f?l.push(5,0,!0,i):r>=5&&((i||!f&&r===5)&&(l.push(r,0,i,o),r=6),f&&(l.push(r,f,0,o),r=6)),i=""},u=0;u<n.length;u++){u&&(r===1&&p(),p(u));for(var d=0;d<n[u].length;d++)a=n[u][d],r===1?a==="<"?(p(),l=[l],r=3):i+=a:r===4?i==="--"&&a===">"?(r=1,i=""):i=a+i[0]:s?a===s?s="":i+=a:a==='"'||a==="'"?s=a:a===">"?(p(),r=1):r&&(a==="="?(r=5,o=i,i=""):a==="/"&&(r<5||n[u][d+1]===">")?(p(),r===3&&(l=l[0]),r=l,(l=l[0]).push(2,0,r),r=0):a===" "||a==="	"||a===`
`||a==="\r"?(p(),r=2):i+=a),r===3&&i==="!--"&&(r=4,l=l[0])}return p(),l})(e)),t),arguments,[])).length>1?t:t[0]}var Jo,qo,Vo=S(()=>{Jo=function(e,t,n,a){var o;t[0]=0;for(var r=1;r<t.length;r++){var i=t[r++],s=t[r]?(t[0]|=i?1:2,n[t[r++]]):t[++r];i===3?a[0]=s:i===4?a[1]=Object.assign(a[1]||{},s):i===5?(a[1]=a[1]||{})[t[++r]]=s:i===6?a[1][t[++r]]+=s+"":i?(o=e.apply(s,Jo(e,s,n,["",null])),a.push(o),s[0]?t[0]|=2:(t[r-2]=0,t[r]=o)):a.push(s)}return a},qo=new Map});var Vn={};N(Vn,{IssueRow:()=>Qo,TrackerColumn:()=>Zo,canHandle:()=>ar,default:()=>gl,icon:()=>nr,label:()=>tr,render:()=>or,trackerBus:()=>Gt,useTracker:()=>Xo});function Yo(e){let t=[],n=null,a=String(e||"").replace(/#([\w-]+)/g,(r,i)=>(t.push(i.toLowerCase()),"")).replace(/!(?:high|h)\b/gi,()=>(n="high","")).replace(/!(?:medium|med|m)\b/gi,()=>(n="medium","")).replace(/!(?:low|l)\b/gi,()=>(n="low","")).replace(/!([123])\b/g,(r,i)=>(n=i==="1"?"high":i==="2"?"medium":"low","")).replace(/\s+/g," ").trim();a||(a="(untitled)");let o=[...new Set(t)];return{summary:a,category:o,priority:n}}function pl(e){let t=e.summary||"",n=Array.isArray(e.category)?e.category:e.category?[e.category]:[];return n.length&&(t+=" "+n.map(a=>"#"+a).join(" ")),e.priority==="high"&&(t+=" !high"),e.priority==="medium"&&(t+=" !med"),e.priority==="low"&&(t+=" !low"),t.trim()}async function ul(e){let t=await Go()(e,{headers:{Accept:"application/ld+json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return t.json()}async function fl(e,t){let n=await Go()(e,{method:"PUT",headers:{"Content-Type":"application/ld+json"},body:JSON.stringify(t,null,2)});if(!n.ok)throw new Error(`PUT failed: ${n.status} ${n.statusText}`);return n}function Xo(e,t){let[n,a]=ge({loading:!t&&!!e,doc:t||null,error:null,status:""}),o=Yt(null);Je(()=>{if(t||!e)return;let d=!1;return ul(e.replace(/#.*$/,"")).then(f=>{d||a(m=>({...m,loading:!1,doc:f}))}).catch(f=>{d||a(m=>({...m,loading:!1,error:f.message}))}),()=>{d=!0}},[e,t]);let r=Kn(d=>{e&&(a(f=>({...f,status:"saving"})),clearTimeout(o.current),o.current=setTimeout(()=>{fl(e.replace(/#.*$/,""),d).then(()=>a(f=>({...f,status:"saved"}))).catch(f=>a(m=>({...m,status:"error",error:f.message})))},500))},[e]),i=Kn(d=>{a(f=>{if(!f.doc)return f;let m=d(f.doc);return r(m),{...f,doc:m,status:"saving"}})},[r]),s=d=>Array.isArray(d.issue)?d.issue:d.issue?[d.issue]:[],l=(d,f)=>({...d,issue:f}),p=()=>new Date().toISOString(),u=(d,f,m)=>{let g=d.filter(k=>k["@id"]!==f["@id"]);if(!m)return[...g,f];let h=g.findIndex(k=>k["@id"]===m);return h<0?[...g,f]:[...g.slice(0,h),f,...g.slice(h)]};return{...n,addIssue:d=>i(f=>{let m=Yo(d),g={"@id":`#Iss${Date.now()}`,"@type":f.issue?.[0]?.["@type"]||"Vtodo",summary:m.summary,status:f.initialState||"NEEDS-ACTION",created:p(),modified:p()};return m.category.length&&(g.category=m.category),m.priority&&(g.priority=m.priority),l(f,[...s(f),g])}),toggleIssue:d=>i(f=>l(f,s(f).map(m=>m["@id"]===d?{...m,status:m.status==="COMPLETED"?"NEEDS-ACTION":"COMPLETED",modified:p()}:m))),editIssue:(d,f)=>i(m=>l(m,s(m).map(g=>{if(g["@id"]!==d)return g;let h=Yo(f),k={...g,summary:h.summary,modified:p()};return h.category.length?k.category=h.category:delete k.category,h.priority?k.priority=h.priority:delete k.priority,k}))),deleteIssue:d=>i(f=>l(f,s(f).filter(m=>m["@id"]!==d))),setTitle:d=>i(f=>({...f,title:d})),addExisting:(d,f)=>i(m=>l(m,u(s(m),{...d,modified:p()},f))),moveWithin:(d,f)=>i(m=>{let g=s(m),h=g.find(k=>k["@id"]===d);return h?l(m,u(g,h,f)):m}),getIssue:d=>s(n.doc||{}).find(f=>f["@id"]===d)}}function Qo({issue:e,trackerUrl:t,onToggle:n,onEdit:a,onDelete:o,onTagClick:r}){let[i,s]=ge(!1),[l,p]=ge(!1),u=Yt(null);Je(()=>{i&&u.current&&(u.current.focus(),u.current.select())},[i]);let d=e.status==="COMPLETED",f=pl(e),m=Array.isArray(e.category)?e.category:e.category?[e.category]:[],g=()=>{let w=u.current.value.trim();w&&w!==f&&a(w),s(!1)},h=w=>{w.dataTransfer.setData("application/x-tracker-pane-issue",JSON.stringify({trackerUrl:t,issueId:e["@id"]})),w.dataTransfer.effectAllowed="move",p(!0)},k=(w,E)=>{w.stopPropagation(),r?.(E)};return V`
    <div class=${"tp-issue "+(d?"tp-done ":"")+(l?"tp-dragging ":"")}
         draggable=${!i}
         data-issue-id=${e["@id"]}
         onDragStart=${h}
         onDragEnd=${()=>p(!1)}>
      <div class=${"tp-check "+(d?"tp-on":"")} onClick=${n}>${d?"\u2713":""}</div>
      ${i?V`<div class="tp-summary tp-editing"><input ref=${u} defaultValue=${f} onBlur=${g} onKeyDown=${w=>{w.key==="Enter"&&(w.preventDefault(),g()),w.key==="Escape"&&(w.preventDefault(),s(!1))}} /></div>`:V`<div class="tp-summary" onClick=${()=>s(!0)}>
            ${e.summary||"(untitled)"}
            ${m.map(w=>V`<span class="tp-tag" title=${"Filter by #"+w} onClick=${E=>k(E,w)}>#${w}</span>`)}
          </div>`}
      ${e.priority?V`<span class=${"tp-pri tp-pri-"+e.priority} title=${"Priority: "+e.priority}>${e.priority[0].toUpperCase()}</span>`:""}
      <div class="tp-del" title="Delete" onClick=${o}>\u00d7</div>
    </div>`}function Zo({url:e,initialDoc:t,hideCompleted:n}){let a=Xo(e,t),[o,r]=ge(""),[i,s]=ge(!1),[l,p]=ge(!1),[u,d]=ge("all"),[f,m]=ge(null),g=Yt(null),h=b=>{b?.preventDefault?.();let R=o.trim();R&&(a.addIssue(R),r(""))};Je(()=>{er()},[]),Je(()=>{l&&g.current&&(g.current.focus(),g.current.select())},[l]);let k=()=>{let b=g.current?.value.trim();b&&b!==(a.doc?.title||"")&&a.setTitle(b),p(!1)};Je(()=>{if(e)return Gt.set(e,{addExisting:a.addExisting,deleteIssue:a.deleteIssue,moveWithin:a.moveWithin,getIssue:a.getIssue}),()=>{Gt.delete(e)}},[e,a.addExisting,a.deleteIssue,a.moveWithin,a.getIssue]);let w=b=>{let R=b.target.closest?.(".tp-issue[data-issue-id]");return R?R.getAttribute("data-issue-id"):null},E=b=>{b.dataTransfer.types.includes("application/x-tracker-pane-issue")&&(b.preventDefault(),b.dataTransfer.dropEffect="move",s(!0))},W=b=>{b.currentTarget.contains(b.relatedTarget)||s(!1)},Z=b=>{b.preventDefault(),s(!1);let R;try{R=JSON.parse(b.dataTransfer.getData("application/x-tracker-pane-issue"))}catch{return}if(!R?.issueId)return;let ua=w(b);if(R.trackerUrl===e)a.moveWithin(R.issueId,ua);else{let en=Gt.get(R.trackerUrl);if(!en)return;let fa=en.getIssue(R.issueId);if(!fa)return;a.addExisting(fa,ua),en.deleteIssue(R.issueId)}};if(a.loading)return V`<div class="tp-col"><div class="tp-col-head"><div class="tp-col-title">Loading\u2026</div></div></div>`;if(a.error&&!a.doc)return V`<div class="tp-col"><div class="tp-col-head"><div class="tp-col-title">Error</div></div><div class="tp-err">${a.error}</div></div>`;let q=a.doc||{},_=Array.isArray(q.issue)?q.issue:q.issue?[q.issue]:[],$=_.filter(b=>b.status!=="COMPLETED").length,A=[...new Set(_.flatMap(b=>Array.isArray(b.category)?b.category:b.category?[b.category]:[]))],P=_.filter(b=>!(n&&b.status==="COMPLETED"||u==="open"&&b.status==="COMPLETED"||u==="done"&&b.status!=="COMPLETED"||f&&!(Array.isArray(b.category)?b.category:b.category?[b.category]:[]).includes(f)));return V`
    <div class=${"tp-col "+(i?"tp-drop-over":"")}
         onDragOver=${E} onDragLeave=${W} onDrop=${Z}>
      <div class="tp-col-head">
        ${l?V`<input ref=${g} class="tp-col-title-input"
              defaultValue=${q.title||""}
              onBlur=${k}
              onKeyDown=${b=>{b.key==="Enter"&&(b.preventDefault(),k()),b.key==="Escape"&&(b.preventDefault(),p(!1))}} />`:V`<div class="tp-col-title" title="Click to rename" onClick=${()=>p(!0)}>${q.title||(e||"").split("/").pop()}</div>`}
        <div class="tp-col-count">${$}/${_.length}</div>
        ${a.status&&V`<div class=${"tp-col-status tp-"+a.status}>${a.status==="saving"?"\u2026 saving":a.status==="saved"?"\u2713 saved":"\u26A0 "+(a.error||"error")}</div>`}
      </div>
      <div class="tp-filters">
        <button class=${"tp-chip "+(u==="all"?"tp-on":"")} onClick=${()=>d("all")}>All</button>
        <button class=${"tp-chip "+(u==="open"?"tp-on":"")} onClick=${()=>d("open")}>Open</button>
        <button class=${"tp-chip "+(u==="done"?"tp-on":"")} onClick=${()=>d("done")}>Done</button>
        ${A.map(b=>V`<button
          class=${"tp-chip tp-tag-chip "+(f===b?"tp-on":"")}
          onClick=${()=>m(f===b?null:b)}>#${b}</button>`)}
        ${P.length!==_.length&&V`<span class="tp-filter-count">${P.length} shown</span>`}
      </div>
      <div class="tp-issues">
        ${P.map(b=>V`<${Qo} key=${b["@id"]} issue=${b} trackerUrl=${e}
          onToggle=${()=>a.toggleIssue(b["@id"])}
          onEdit=${R=>a.editIssue(b["@id"],R)}
          onDelete=${()=>a.deleteIssue(b["@id"])}
          onTagClick=${R=>m(f===R?null:R)} />`)}
      </div>
      ${e&&V`<form class="tp-add-row" onSubmit=${h}>
        <input type="text" placeholder="+ add task \u2014 type #tag and !high/!med/!low" value=${o} onInput=${b=>r(b.target.value)} />
      </form>`}
    </div>`}function er(){if(document.getElementById("tracker-pane-css"))return;let e=document.createElement("style");e.id="tracker-pane-css",e.textContent=`
.tp-col { background: var(--bg-elev); border: 1px solid var(--line); border-radius: var(--radius, 14px); padding: 16px; display: flex; flex-direction: column; box-shadow: var(--shadow); min-height: 240px; font-family: var(--sans); color: var(--text); }
.tp-col-head { display: flex; align-items: baseline; gap: 10px; padding: 0 4px 12px; border-bottom: 1px solid var(--line); margin-bottom: 12px; }
.tp-col-title { font: 700 16px/1 var(--sans); cursor: text; padding: 1px 4px; margin: -1px -4px; border-radius: 4px; transition: background .12s; }
.tp-col-title:hover { background: var(--accent-soft); }
.tp-col-title-input { font: 700 16px/1 var(--sans); padding: 1px 4px; border: 1px solid var(--accent); border-radius: 4px; outline: none; box-shadow: 0 0 0 2px var(--accent-soft); background: var(--bg-elev); color: var(--text); min-width: 0; max-width: 220px; }
.tp-col-count { font: 600 11px/1 var(--sans); letter-spacing: .12em; text-transform: uppercase; color: var(--text-faint); }
.tp-col-status { margin-left: auto; font: 500 11px/1 var(--sans); color: var(--text-faint); }
.tp-col-status.tp-saving { color: var(--warn); }
.tp-col-status.tp-saved  { color: var(--good); }
.tp-col-status.tp-error  { color: var(--danger); }

/* Filter bar */
.tp-filters { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 0 10px; align-items: center; }
.tp-chip { font: 600 11px/1 var(--sans); letter-spacing: .04em; padding: 4px 9px; border-radius: 100px; border: 1px solid var(--line); background: transparent; color: var(--text-dim); cursor: pointer; transition: all .12s; }
.tp-chip:hover { color: var(--text); border-color: var(--line-2); }
.tp-chip.tp-on { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
.tp-tag-chip { font-family: var(--mono); }
.tp-filter-count { margin-left: auto; font: 500 11px/1 var(--mono); color: var(--text-faint); }

.tp-issues { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.tp-issue { display: flex; align-items: flex-start; gap: 10px; padding: 7px 6px; border-radius: 8px; transition: background .12s; cursor: grab; animation: tp-slidein .22s var(--easing, cubic-bezier(.2,.8,.2,1)); }
.tp-issue:hover { background: var(--bg-elev-2); }
.tp-issue:active { cursor: grabbing; }
.tp-issue.tp-dragging { opacity: 0.4; }
.tp-issue.tp-done .tp-summary { color: var(--text-faint); text-decoration: line-through; }
@keyframes tp-slidein { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }

.tp-check { width: 18px; height: 18px; border-radius: 5px; border: 2px solid var(--text-faint); background: transparent; flex: 0 0 auto; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; color: transparent; margin-top: 2px; transition: all .15s; }
.tp-check:hover { border-color: var(--accent); }
.tp-check.tp-on { background: var(--accent); border-color: var(--accent); color: var(--text-on-accent, white); animation: tp-checkpop .26s var(--easing, cubic-bezier(.2,.8,.2,1)); }
@keyframes tp-checkpop { 0% { transform: scale(.85); } 55% { transform: scale(1.18); } 100% { transform: scale(1); } }

.tp-summary { flex: 1; min-width: 0; word-break: break-word; cursor: text; padding: 1px 4px; margin: -1px -4px; border-radius: 4px; font: 400 14px/1.4 var(--sans); display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }
.tp-summary:hover { background: var(--bg-elev-2); }
.tp-summary.tp-editing { background: var(--bg-elev-2); padding: 0; margin: 0; }
.tp-summary input { width: 100%; padding: 1px 4px; border: 1px solid var(--accent); border-radius: 4px; font: inherit; outline: none; box-shadow: 0 0 0 2px var(--accent-soft); background: var(--bg-elev); color: var(--text); }

.tp-tag { font: 600 10px/1 var(--mono); letter-spacing: .02em; padding: 2px 7px; border-radius: 100px; background: var(--accent-soft); color: var(--accent); cursor: pointer; flex: 0 0 auto; transition: all .12s; }
.tp-tag:hover { background: var(--accent); color: var(--text-on-accent, white); }

.tp-pri { font: 700 10px/1 var(--mono); letter-spacing: .04em; min-width: 16px; height: 16px; padding: 0 5px; border-radius: 100px; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; margin-top: 4px; }
.tp-pri-high   { background: rgba(239,68,68,.16); color: var(--danger); }
.tp-pri-medium { background: rgba(251,191,36,.16); color: var(--warn); }
.tp-pri-low    { background: var(--bg-elev-2); color: var(--text-faint); }

.tp-del { opacity: 0; transition: opacity .12s, color .12s; cursor: pointer; padding: 0 4px; color: var(--text-faint); font-size: 16px; line-height: 1; flex: 0 0 auto; margin-top: 2px; }
.tp-issue:hover .tp-del { opacity: 1; }
.tp-del:hover { color: var(--danger); }

.tp-add-row { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--line); }
.tp-add-row input { width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 9px; font: 400 14px/1.4 var(--sans); outline: none; background: var(--bg-elev-2); color: var(--text); transition: border-color .12s, background .12s, box-shadow .12s; }
.tp-add-row input::placeholder { color: var(--text-faint); }
.tp-add-row input:focus { border-color: var(--accent); background: var(--bg-elev); box-shadow: 0 0 0 2px var(--accent-soft); }

.tp-col.tp-drop-over { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.tp-err { background: rgba(239,68,68,.12); color: var(--danger); padding: 10px 14px; border-radius: 8px; font: 400 13px/1.4 var(--sans); }
`,document.head.appendChild(e)}function vl(e,t){if(!t||!e)return null;let n=e&&typeof e=="object"?e.value:e,a=t.get?.(n);return a===void 0&&!t.type?null:t.type?t.type(a!==void 0?a:n):null}function ml(e){return e?(Array.isArray(e)?e:[e]).some(n=>typeof n=="string"&&/(^|[#:/])Tracker$/i.test(n)):!1}function ar(e,t){return ml(vl(e,t))}function or(e,t,n,a){er();let r=document.querySelector('script[type="application/ld+json"]')?.getAttribute("src"),i=e?.value||"",s=r?new URL(r,window.location.href).href:/^https?:\/\//.test(i)?i.replace(/#.*$/,""):null;Po(qt(Zo,{url:s,initialDoc:a||null}),n)}var V,Go,Gt,tr,nr,gl,rr=S(()=>{Bn();Wo();Vo();V=Ko.bind(qt);Go=()=>window.xlogin&&window.xlogin.authFetch||fetch;Gt=new Map;tr="Tasks",nr="\u2705";gl={label:tr,icon:nr,canHandle:ar,render:or}});var Yn={};N(Yn,{canHandle:()=>xl,meta:()=>hl,render:()=>bl});function xl(e){if(e?.forClass===J)return!0;let t=e?.doc?.["@type"];return typeof t=="string"?/(^|[#/])Tracker$/i.test(t):Array.isArray(t)?t.some(n=>typeof n=="string"&&/(^|[#/])Tracker$/i.test(n)):!1}async function yl(){return Xt||(Xt=await import("https://solid-apps.github.io/pilot/tracker-pane.js"),Xt)}async function bl(e,t,n){let{url:a,doc:o}=e;try{(await yl()).render({value:a},null,t,o)}catch(r){t.innerHTML=`
      <div class="card" style="color:var(--danger);max-width:640px">
        <strong>Couldn't load pilot's tracker pane.</strong>
        <div style="margin-top:8px;font-size:13px;font-family:var(--mono);word-break:break-all">${c(r.message)}</div>
        <div style="margin-top:8px;font-size:13px;color:var(--text-dim)">Disable the pilot pane in Settings to fall back to the built-in tracker.</div>
      </div>
    `}}var hl,Xt,ir=S(()=>{D();M();hl={id:"pilot/tracker",name:"Pilot tracker (drag-drop kanban)",forClass:J};Xt=null});var Xn={};N(Xn,{canHandle:()=>ur,default:()=>Sl,icon:()=>pr,label:()=>cr,meta:()=>kl,render:()=>fr});function ur(e,t){return e?.termType&&e.termType!=="NamedNode"||!t?.statementsMatching?!1:t.statementsMatching(e,void 0,void 0).some(a=>{if(a.predicate?.value!==wl)return!1;let o=a.object?.value;return dr.includes(o)||typeof o=="string"&&(o==="ItemList"||/[#/:]ItemList$/.test(o)||/(?:^|:)ItemList$/.test(o))})}function Le(e,...t){if(e){for(let n of t)if(e[n]!==void 0)return e[n]}}async function fr(e,t,n,a){let o=e?.value,r=a;if(!r){n.innerHTML='<div class="empty">Failed to load list</div>';return}El();let i=Le(r,...lr)||[],l=(Array.isArray(i)?i:[i]).map(_=>({name:Le(_,...Gn)||"Untitled",description:Le(_,...sr)||null,position:parseInt(Le(_,..._l)??"0",10),done:(()=>{let $=Le(_,...$l);return $?String($).toLowerCase().includes("completed"):!1})(),dateCreated:Le(_,...Cl)||null})).sort((_,$)=>_.dateCreated&&!$.dateCreated?-1:!_.dateCreated&&$.dateCreated?1:_.dateCreated&&$.dateCreated?new Date($.dateCreated)-new Date(_.dateCreated):$.position-_.position),p=Le(r,...Gn)||"Todo List",u=Le(r,...sr)||null;n.innerHTML=`
    <div class="hl">
      <div class="hl-header">
        <div class="hl-title-row">
          <span class="hl-icon">${y.tasks}</span>
          <h1 class="hl-title" data-edit-title>${c(p)}</h1>
        </div>
        ${u?`<div class="hl-desc">${c(u)}</div>`:""}
        <div class="hl-stats" id="hl-stats"></div>
      </div>
      <div class="hl-progress-wrap"><div class="hl-progress-bar"><div class="hl-progress-fill" id="hl-progress"></div></div></div>
      <div class="hl-add">
        <input class="hl-add-input" id="hl-input" type="text" placeholder="Add a task and press Enter\u2026" />
        <button class="hl-add-btn" id="hl-add-btn">Add</button>
      </div>
      <div class="hl-filters" id="hl-filters">
        <button class="hl-filter" data-filter="all">All</button>
        <button class="hl-filter" data-filter="active">Active</button>
        <button class="hl-filter" data-filter="done">Done</button>
      </div>
      <div class="hl-list" id="hl-list"></div>
      <div class="hl-source" data-url>${c(o||"")}</div>
    </div>
  `;let d=n.querySelector("#hl-list"),f=n.querySelector("#hl-stats"),m=n.querySelector("#hl-progress"),g=n.querySelector("#hl-input"),h=n.querySelector("#hl-add-btn"),k=n.querySelector("[data-edit-title]"),w=localStorage.getItem("hl-filter:"+(o||"default"))||"all",E=se(async()=>{let _=lr.find(A=>r[A]!==void 0)||"schema:itemListElement",$=Gn.find(A=>r[A]!==void 0)||"schema:name";r[$]=p,r[_]=l.map((A,P)=>{let b={"@type":"schema:ListItem","schema:name":A.name,"schema:position":P+1};return A.description&&(b["schema:description"]=A.description),A.done&&(b["schema:status"]="completed"),A.dateCreated&&(b["schema:dateCreated"]=A.dateCreated),b});try{await H(o.replace(/#.*$/,""),r),n.dispatchEvent(new CustomEvent("pane:change",{detail:{url:o,doc:r}}))}catch(A){x("Save failed: "+A.message,"error")}},400);function W(){let _=l.length,$=l.filter(b=>b.done).length,A=_-$,P=_?Math.round($/_*100):0;f.innerHTML=`<span class="hl-stat"><span class="hl-stat-num">${_}</span> total</span><span class="hl-stat"><span class="hl-stat-num">${A}</span> active</span><span class="hl-stat"><span class="hl-stat-num">${$}</span> done</span>`,m.style.width=P+"%"}function Z(){d.innerHTML="",n.querySelectorAll(".hl-filter").forEach($=>{$.classList.toggle("active",$.dataset.filter===w)});let _=l.filter($=>w==="active"?!$.done:w==="done"?$.done:!0);if(!_.length){d.innerHTML=`<div class="hl-empty">${w==="done"?"No completed tasks yet":w==="active"?"All tasks complete.":"No tasks yet \u2014 add one above."}</div>`;return}for(let $ of _){let A=document.createElement("div");A.className="hl-item"+($.done?" done":""),A.innerHTML=`
        <div class="hl-checkbox ${$.done?"checked":""}" data-act="toggle">${$.done?"\u2713":""}</div>
        <div class="hl-info">
          <div class="hl-name">${c($.name)}</div>
          ${$.description?`<div class="hl-item-desc">${c($.description)}</div>`:""}
          ${$.dateCreated?`<div class="hl-item-date">${Ll($.dateCreated)}</div>`:""}
        </div>
        <div class="hl-actions">
          <button class="hl-item-btn hl-bump" title="Bump to top" data-act="bump">\u2191</button>
          <button class="hl-item-btn" title="Delete" data-act="delete">\xD7</button>
        </div>
      `,A.querySelector('[data-act="toggle"]').addEventListener("click",()=>{$.done=!$.done,W(),Z(),E()}),A.querySelector('[data-act="bump"]').addEventListener("click",()=>{let P=l.indexOf($);P>0&&l.splice(P,1),$.dateCreated=new Date().toISOString(),l.unshift($),Z(),E()}),A.querySelector('[data-act="delete"]').addEventListener("click",()=>{let P=l.indexOf($);P!==-1&&l.splice(P,1),W(),Z(),E()}),d.appendChild(A)}}function q(){let _=g.value.trim();_&&(l.unshift({name:_,description:null,position:l.length+1,done:!1,dateCreated:new Date().toISOString()}),g.value="",W(),Z(),E())}n.querySelectorAll(".hl-filter").forEach(_=>{_.addEventListener("click",()=>{w=_.dataset.filter,localStorage.setItem("hl-filter:"+(o||"default"),w),Z()})}),g.addEventListener("keydown",_=>{_.key==="Enter"&&q()}),h.addEventListener("click",q),k.contentEditable="true",k.addEventListener("blur",()=>{let _=k.textContent.trim();_&&_!==p&&(p=_,E())}),k.addEventListener("keydown",_=>{_.key==="Enter"&&(_.preventDefault(),k.blur())}),W(),Z()}function Ll(e){try{let t=new Date(e);return t.toLocaleDateString(void 0,{month:"short",day:"numeric"})+" \xB7 "+t.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}catch{return e}}function El(){if(document.getElementById("hl-pane-css"))return;let e=document.createElement("style");e.id="hl-pane-css",e.textContent=`
.hl { font-family: var(--sans); color: var(--text); background: var(--bg-elev); border: 1px solid var(--line); border-radius: var(--radius, 14px); overflow: hidden; box-shadow: var(--shadow); }

.hl-header { padding: 18px 22px; border-bottom: 1px solid var(--line); }
.hl-title-row { display: flex; align-items: center; gap: 10px; }
.hl-icon { display: inline-grid; place-items: center; width: 24px; height: 24px; color: var(--accent); }
.hl-icon svg { width: 20px; height: 20px; }
.hl-title { margin: 0; font: 700 19px/1.1 var(--sans); letter-spacing: -.01em; outline: none; padding: 1px 4px; margin: -1px -4px; border-radius: 4px; cursor: text; }
.hl-title:focus { background: var(--accent-soft); }
.hl-desc { margin-top: 6px; font-size: 13px; color: var(--text-dim); }
.hl-stats { display: flex; gap: 18px; margin-top: 12px; font-size: 12px; color: var(--text-dim); }
.hl-stat-num { font-weight: 700; color: var(--text); margin-right: 2px; font-family: var(--mono); }

.hl-progress-wrap { padding: 0 22px; margin: 8px 0 14px; }
.hl-progress-bar { height: 4px; background: var(--bg-elev-2); border-radius: 100px; overflow: hidden; }
.hl-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2, var(--accent))); border-radius: 100px; transition: width .25s var(--easing, cubic-bezier(.2,.8,.2,1)); }

.hl-add { display: flex; gap: 8px; padding: 0 22px 12px; }
.hl-add-input { flex: 1; padding: 9px 12px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 9px; font: 400 14px var(--sans); outline: none; color: var(--text); transition: border-color .12s, background .12s, box-shadow .12s; }
.hl-add-input::placeholder { color: var(--text-faint); }
.hl-add-input:focus { border-color: var(--accent); background: var(--bg-elev); box-shadow: 0 0 0 2px var(--accent-soft); }
.hl-add-btn { padding: 9px 16px; background: linear-gradient(135deg, var(--accent), var(--accent-2, var(--accent))); color: var(--text-on-accent, #fff); border: none; border-radius: 9px; font: 600 13px var(--sans); cursor: pointer; }
.hl-add-btn:hover { transform: translateY(-1px); }

.hl-filters { display: flex; gap: 4px; padding: 0 22px 8px; border-bottom: 1px solid var(--line); }
.hl-filter { padding: 6px 12px; background: transparent; border: none; border-bottom: 2px solid transparent; font: 500 12px var(--sans); color: var(--text-dim); cursor: pointer; transition: color .12s, border-color .12s; }
.hl-filter:hover { color: var(--text); }
.hl-filter.active { color: var(--accent); border-bottom-color: var(--accent); }

.hl-list { padding: 6px 14px 6px; display: flex; flex-direction: column; gap: 2px; }
.hl-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 8px; border-radius: 8px; transition: background .12s; animation: hl-slidein .22s var(--easing, cubic-bezier(.2,.8,.2,1)); }
.hl-item:hover { background: var(--bg-elev-2); }
.hl-item.done .hl-name { color: var(--text-faint); text-decoration: line-through; }
@keyframes hl-slidein { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }

.hl-checkbox { width: 20px; height: 20px; border-radius: 5px; border: 2px solid var(--text-faint); display: grid; place-items: center; cursor: pointer; flex-shrink: 0; margin-top: 1px; font-size: 12px; color: transparent; transition: all .15s; }
.hl-checkbox:hover { border-color: var(--accent); }
.hl-checkbox.checked { background: var(--accent); border-color: var(--accent); color: var(--text-on-accent, #fff); animation: hl-pop .26s var(--easing, cubic-bezier(.2,.8,.2,1)); }
@keyframes hl-pop { 0% { transform: scale(.85); } 55% { transform: scale(1.18); } 100% { transform: scale(1); } }

.hl-info { flex: 1; min-width: 0; }
.hl-name { font: 400 14px/1.4 var(--sans); word-break: break-word; }
.hl-item-desc { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.hl-item-date { font: 400 11px var(--mono); color: var(--text-faint); margin-top: 4px; }

.hl-actions { display: flex; gap: 2px; opacity: 0; transition: opacity .12s; }
.hl-item:hover .hl-actions { opacity: 1; }
.hl-item-btn { width: 26px; height: 26px; border: none; background: transparent; border-radius: 6px; cursor: pointer; color: var(--text-faint); font-size: 16px; line-height: 1; transition: background .12s, color .12s; }
.hl-item-btn:hover { background: var(--bg-elev-3, var(--bg-elev-2)); color: var(--danger); }
.hl-item-btn.hl-bump:hover { color: var(--good); }

.hl-empty { padding: 32px 24px; text-align: center; color: var(--text-faint); font-size: 13px; }

.hl-source { padding: 8px 22px; font: 400 11px var(--mono); color: var(--text-faint); border-top: 1px solid var(--line); word-break: break-all; }
`,document.head.appendChild(e)}var dr,wl,cr,pr,kl,Gn,sr,_l,$l,Cl,lr,Sl,vr=S(()=>{D();M();dr=["http://schema.org/ItemList","https://schema.org/ItemList"],wl="http://www.w3.org/1999/02/22-rdf-syntax-ns#type",cr="List",pr="\u2705",kl={id:"hub-pod/list",name:"Todo list",forClasses:dr};Gn=["schema:name","name","https://schema.org/name","http://schema.org/name"],sr=["schema:description","description","https://schema.org/description","http://schema.org/description"],_l=["schema:position","position","https://schema.org/position","http://schema.org/position"],$l=["schema:status","status","schema:actionStatus","actionStatus"],Cl=["schema:dateCreated","dateCreated","https://schema.org/dateCreated","http://schema.org/dateCreated"],lr=["schema:itemListElement","itemListElement","https://schema.org/itemListElement","http://schema.org/itemListElement"];Sl={label:cr,icon:pr,canHandle:ur,render:fr}});var Qn={};N(Qn,{canHandle:()=>hr,default:()=>Al,icon:()=>gr,label:()=>mr,meta:()=>Tl,render:()=>xr});function hr(e,t){return e?.termType&&e.termType!=="NamedNode"||!t?.statementsMatching?!1:t.statementsMatching(e,void 0,void 0).some(a=>{if(a.predicate?.value!==Il)return!1;let o=a.object?.value;return ne.includes(o)||o==="TextDocument"||o==="Article"||o==="CreativeWork"||typeof o=="string"&&/[#/](TextDocument|Article|CreativeWork)$/.test(o)})}async function xr(e,t,n,a){let o=e?.value,r=a;if(!r){n.innerHTML=`<div class="empty">Failed to load note: <code>${c(o)}</code></div>`;return}let i=se(async()=>{r.headline=n.querySelector("#note-title")?.value??r.headline,r.text=n.querySelector("#note-body")?.value??r.text,r.datePublished=new Date().toISOString(),l("saving");try{await H(o,r),l("saved"),n.dispatchEvent(new CustomEvent("pane:change",{detail:{url:o,doc:r}}))}catch(p){l("err",p.message)}},600);s();function s(){n.innerHTML=`
      <div class="meta">
        <span><b style="color:var(--text)">Saved</b> \xB7 <span id="save-status" class="saved">in sync</span></span>
        <span style="color:var(--text-faint)">${c(oe(r.datePublished))}</span>
        <span style="color:var(--text-faint);font-family:var(--mono);font-size:11px;margin-left:auto">${c(o)}</span>
        <button class="btn danger" id="del-note" title="Delete">${y.trash}</button>
      </div>
      <input class="title" id="note-title" value="${c(r.headline||"")}" placeholder="Untitled note" />
      <textarea class="body" id="note-body" placeholder="Write in markdown \u2014 supports # headers, **bold**, *italic*, [links](url), and images.">${c(r.text||"")}</textarea>
    `,n.querySelector("#note-title").addEventListener("input",i),n.querySelector("#note-body").addEventListener("input",i),n.querySelector("#del-note").addEventListener("click",async()=>{if(confirm("Delete this note?"))try{await ce(o),x("Deleted","success"),n.dispatchEvent(new CustomEvent("pane:delete",{detail:{url:o}}))}catch(p){x("Delete failed: "+p.message,"error")}})}function l(p,u){let d=n.querySelector("#save-status");d&&(p==="saving"?(d.className="saving",d.textContent="saving\u2026"):p==="saved"?(d.className="saved",d.textContent="in sync"):p==="err"&&(d.className="err",d.textContent="save error: "+(u||"")))}}var mr,gr,Tl,Il,Al,yr=S(()=>{D();M();mr="Note",gr="\u{1F4C4}",Tl={id:"hub-pod/note",name:"Note (markdown)",forClasses:ne},Il="http://www.w3.org/1999/02/22-rdf-syntax-ns#type";Al={label:mr,icon:gr,canHandle:hr,render:xr}});var Zn={};N(Zn,{canHandle:()=>kr,default:()=>Ml,icon:()=>wr,label:()=>br,meta:()=>Pl,render:()=>_r});function kr(e,t){return e?.termType&&e.termType!=="NamedNode"||!t?.statementsMatching?!1:t.statementsMatching(e,void 0,void 0).some(a=>{if(a.predicate?.value!==Nl)return!1;let o=a.object?.value;return ae.includes(o)||o==="Vevent"||o==="Event"||typeof o=="string"&&/[#/](Vevent|Event)$/.test(o)})}async function _r(e,t,n,a){let o=e?.value,r=a;if(!r){n.innerHTML='<div class="empty">Failed to load event</div>';return}let i=se(async()=>{r.summary=n.querySelector("#ev-summary")?.value??r.summary,r.location=n.querySelector("#ev-location")?.value??r.location;try{await H(o.replace(/#.*$/,""),r),n.dispatchEvent(new CustomEvent("pane:change",{detail:{url:o,doc:r}}))}catch(p){x("Save failed: "+p.message,"error")}},600),s=new Date(r.dtstart),l=isNaN(s)?r.dtstart||"":s.toLocaleString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"});n.innerHTML=`
    <div class="card" style="margin:18px 24px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:12px">
        <input id="ev-summary" value="${c(r.summary||"")}" placeholder="Event title"
               style="font-size:20px;font-weight:600;border:none;outline:none;background:transparent;color:var(--text);flex:1;letter-spacing:-.01em" />
        <button class="btn danger" id="ev-del" title="Delete">${y.trash}</button>
      </div>
      <div style="color:var(--text-dim);font-size:14px;margin-bottom:14px">${c(l)}</div>
      <div style="display:grid;grid-template-columns:80px 1fr;gap:10px;align-items:center;font-size:14px">
        <div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">Location</div>
        <input id="ev-location" value="${c(r.location||"")}" placeholder="(none)"
               style="background:var(--bg-elev-2);border:1px solid var(--line);border-radius:6px;padding:6px 10px;color:var(--text);font:inherit;outline:none" />
      </div>
      <div style="margin-top:14px;font-size:11px;color:var(--text-faint);font-family:var(--mono);word-break:break-all">${c(o)}</div>
    </div>
  `,n.querySelector("#ev-summary").addEventListener("input",i),n.querySelector("#ev-location").addEventListener("input",i),n.querySelector("#ev-del").addEventListener("click",async()=>{if(confirm(`Delete "${r.summary||"this event"}"?`))try{await ce(o.replace(/#.*$/,"")),x("Event deleted","success"),n.dispatchEvent(new CustomEvent("pane:delete",{detail:{url:o}}))}catch(p){x("Delete failed: "+p.message,"error")}})}var br,wr,Pl,Nl,Ml,$r=S(()=>{D();M();br="Event",wr="\u{1F4C5}",Pl={id:"hub-pod/event",name:"Event detail",forClasses:ae},Nl="http://www.w3.org/1999/02/22-rdf-syntax-ns#type";Ml={label:br,icon:wr,canHandle:kr,render:_r}});var ea={};N(ea,{canHandle:()=>Er,default:()=>Hl,icon:()=>Lr,label:()=>Cr,meta:()=>Dl,render:()=>Sr});function Er(e,t){if(e?.termType&&e.termType!=="NamedNode")return!1;let n=e?.value;return!n||!/\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(n)?!1:!(t?.statementsMatching?.(e,void 0,void 0)||[]).some(r=>r.predicate?.value==="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"&&typeof r.object?.value=="string"&&r.object.value.startsWith("http://www.w3.org/ns/ldp#"))}async function Sr(e,t,n,a){let o=e?.value,r=a?.title,i=a?.alt;n.className="photo",n.dataset.src=o,n.innerHTML=`
    <img src="${c(o)}" loading="lazy" alt="${c(i||r||"")}" />
    ${r?`<div class="fade">${c(r)}</div>`:""}
  `,n.addEventListener("click",()=>window.open(o,"_blank"))}var Cr,Lr,Dl,Hl,Tr=S(()=>{M();Cr="Photo",Lr="\u{1F5BC}",Dl={id:"hub-pod/photo",name:"Photo tile"};Hl={label:Cr,icon:Lr,canHandle:Er,render:Sr}});var ta={};N(ta,{canHandle:()=>Mr,default:()=>jl,icon:()=>Nr,label:()=>Pr,meta:()=>Rl,render:()=>Dr});function Mr(e,t){return e?.termType&&e.termType!=="NamedNode"||!t?.statementsMatching?!1:t.statementsMatching(e,void 0,void 0).some(a=>{if(a.predicate?.value!==zl)return!1;let o=a.object?.value;return o===Ar||o==="Person"||o==="foaf:Person"||o==="schema:Person"||typeof o=="string"&&/[#/]Person$/.test(o)})}async function Dr(e,t,n,a){let o=e?.value,r=a||{};return(r.mode||"full")==="card"?Ul(o,r,n):Ol(o,r,n)}function Ol(e,t,n){let{profile:a,raw:o}=t;if(!a){n.innerHTML='<div class="empty">No profile.</div>';return}r();function r(){n.innerHTML=`
      <div class="card">
        <div class="profile-hero">
          ${Ue(a,"lg")}
          <div class="info">
            <h1>${c(a.name||"Unnamed")}</h1>
            <div class="webid">${c(a["@id"]||e)}</div>
            <div class="profile-fields">
              ${Ir.map(i).join("")}
            </div>
          </div>
        </div>
      </div>
      ${o?`
        <div class="card">
          <h2>${y.code} Raw subject (JSON-LD)</h2>
          <pre style="font-family:var(--mono);font-size:12px;color:var(--text-dim);overflow:auto;max-height:280px;background:var(--bg-elev-2);padding:14px 16px;border-radius:8px;border:1px solid var(--line)">${c(JSON.stringify(re(o,e.includes("#")?e.split("#")[1]:null),null,2))}</pre>
        </div>
      `:""}
    `,T(".profile-field",n).forEach(p=>p.addEventListener("click",()=>s(p)))}function i(p){let u=a[p.key];return`
      <div class="profile-field" data-key="${p.key}">
        <div class="lbl">${p.label}</div>
        <div class="val ${u?"":"empty"}">${u?c(u):"(click to add)"}</div>
      </div>
    `}function s(p){let u=p.dataset.key,d=Ir.find(h=>h.key===u),f=a[u]||"",m=p.querySelector(".val");m.innerHTML=`<input type="text" value="${c(f)}" />`;let g=m.querySelector("input");g.focus(),g.select(),g.addEventListener("blur",()=>l(d,g.value.trim())),g.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),g.blur()),h.key==="Escape"&&r()})}async function l(p,u){if(!o){x("No raw doc \u2014 can't save","error"),r();return}let d=re(o,e.includes("#")?e.split("#")[1]:null);if(u){let f=p.mailto&&!u.startsWith("mailto:")?"mailto:"+u:u,g=Object.keys(d).find(h=>/(?:foaf|name|nick|email|mbox|homepage|img|depiction)/i.test(h)&&h.includes(p.key))||(p.key==="email"?"http://xmlns.com/foaf/0.1/mbox":p.pred);p.key==="name"||p.key==="nick"?d[g]=f:d[g]={"@id":f}}else["foaf:"+p.key,p.pred,p.key].forEach(f=>{delete d[f]});a[p.key]=u||void 0,x("Saving\u2026");try{await wa(e.replace(/#.*$/,""),o),x("Saved","success"),n.dispatchEvent(new CustomEvent("pane:change",{detail:{url:e,doc:o}}))}catch(f){x("Save failed: "+f.message,"error")}r()}}function Ul(e,t,n){let{profile:a}=t,o=a?.name||"Loading\u2026";n.className="contact-card",n.innerHTML=`
    ${a?.img?`<div class="ava"><img src="${c(a.img)}" alt="${c(o)}" onerror="this.parentNode.textContent='${c($e(o))}'"></div>`:`<div class="ava">${c($e(o))}</div>`}
    <div class="name">${c(o)}</div>
    <div class="webid">${c(e)}</div>
  `,n.style.cursor="pointer",n.addEventListener("click",()=>window.open(e,"_blank"))}var Ar,zl,Pr,Nr,Rl,Ir,jl,Hr=S(()=>{D();M();Ar="http://xmlns.com/foaf/0.1/Person",zl="http://www.w3.org/1999/02/22-rdf-syntax-ns#type",Pr="Person",Nr="\u{1F464}",Rl={id:"hub-pod/person",name:"Person profile",forClass:Ar};Ir=[{key:"name",label:"Name",pred:"http://xmlns.com/foaf/0.1/name"},{key:"nick",label:"Nick",pred:"http://xmlns.com/foaf/0.1/nick"},{key:"email",label:"Email",pred:"http://xmlns.com/foaf/0.1/mbox",mailto:!0},{key:"homepage",label:"Homepage",pred:"http://xmlns.com/foaf/0.1/homepage"},{key:"img",label:"Avatar",pred:"http://xmlns.com/foaf/0.1/img"}];jl={label:Pr,icon:Nr,canHandle:Mr,render:Dr}});var na={};N(na,{canHandle:()=>Or,default:()=>Jl,icon:()=>Rr,label:()=>zr,meta:()=>Fl,render:()=>Ur});function Or(e,t,n){return e?.termType&&e.termType!=="NamedNode"||!e?.value||!t?.statementsMatching||n?.view!=="tile"?!1:t.statementsMatching(e,void 0,void 0).some(o=>o.predicate?.value!=="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"?!1:o.object?.value===Bl||o.object?.value===Wl)}async function Ur(e,t,n,a){let o=e?.value,r=a?.type,i=r==="container",s=decodeURIComponent(o.replace(/\/$/,"").split("/").pop()||o),l=i?"dir":jr(s),p=i?y.files:ql(s);n.className=`file-card ${l}`,n.dataset.url=o,n.title=o,n.innerHTML=`
    <div class="fi">${p}</div>
    <div class="fn">${c(s)}</div>
    <div class="fs">${i?"folder":""}</div>
  `,n.addEventListener("click",()=>{i?n.dispatchEvent(new CustomEvent("pane:open",{detail:{url:o,type:r}})):window.open(o,"_blank")})}function jr(e){return/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(e)?"img":/\.(mp3|ogg|wav|flac)$/i.test(e)?"audio":/\.(jsonld|json|js|css|ttl|n3|xml|html?)$/i.test(e)?"code":/\.(md|txt)$/i.test(e)?"doc":"other"}function ql(e){let t=jr(e);return t==="img"?y.img:t==="code"?y.code:y.doc}var zr,Rr,Fl,Bl,Wl,Jl,Fr=S(()=>{M();zr="File",Rr="\u{1F4C1}",Fl={id:"hub-pod/file",name:"File / folder card"},Bl="http://www.w3.org/ns/ldp#Container",Wl="http://www.w3.org/ns/ldp#Resource";Jl={label:zr,icon:Rr,canHandle:Or,render:Ur}});var aa={};N(aa,{canHandle:()=>qr,default:()=>Xl,icon:()=>Wr,label:()=>Br,meta:()=>Kl,render:()=>Jr});function qr(e,t,n){return e?.termType&&e.termType!=="NamedNode"||!e?.value||!t?.statementsMatching||n?.view==="tile"?!1:t.statementsMatching(e,void 0,void 0).some(o=>o.predicate?.value===Vl&&o.object?.value===Yl)}async function Jr(e,t,n,a,o){let r=e?.value;Gl(),n.innerHTML='<div class="container-pane-spinner"><div class="spinner"></div></div>';let i;try{i=await F(r)}catch(u){n.innerHTML=`<div class="container-pane-empty">
      <div class="container-pane-empty-title" style="color:var(--danger)">Couldn't list this container</div>
      <div class="container-pane-empty-body">${c(u.message)}</div>
      <div class="container-pane-empty-body" style="margin-top:6px;font-family:var(--mono);font-size:11px">${c(r)}</div>
    </div>`;return}if(!i.length){n.innerHTML=`<div class="container-pane-empty">
      <div class="container-pane-empty-title">Empty container</div>
      <div class="container-pane-empty-body" style="font-family:var(--mono);font-size:11px">${c(r)}</div>
    </div>`;return}let l={doc:{items:i.map(u=>({url:u.url,doc:{type:u.type,view:"tile"},forClass:u.type==="container"?"http://www.w3.org/ns/ldp#Container":"http://www.w3.org/ns/ldp#Resource"})),layout:"grid"}},p=O(l);if(!p){n.innerHTML=`<div class="container-pane-empty">
      <div class="container-pane-empty-title" style="color:var(--danger)">No CollectionPane registered</div>
    </div>`;return}n.innerHTML="",await p.render(l,n,o)}function Gl(){if(document.getElementById("container-pane-css"))return;let e=document.createElement("style");e.id="container-pane-css",e.textContent=`
.container-pane-spinner { display: grid; place-items: center; padding: 60px 0; }
.container-pane-empty { padding: 32px 24px; text-align: center; color: var(--text-faint); }
.container-pane-empty-title { font-size: 15px; color: var(--text); margin-bottom: 4px; }
.container-pane-empty-body { font-size: 13px; }
`,document.head.appendChild(e)}var Br,Wr,Kl,Vl,Yl,Xl,Kr=S(()=>{D();G();M();Br="Container",Wr="\u{1F4C2}",Kl={id:"hub-pod/container",name:"LDP container (folder view)"},Vl="http://www.w3.org/1999/02/22-rdf-syntax-ns#type",Yl="http://www.w3.org/ns/ldp#Container";Xl={label:Br,icon:Wr,canHandle:qr,render:Jr}});var ia={};N(ia,{canHandle:()=>Qr,default:()=>od,icon:()=>Xr,label:()=>Gr,meta:()=>ed,render:()=>Zr});function Qr(e,t){return e?.termType&&e.termType!=="NamedNode"||!t?.statementsMatching?!1:t.statementsMatching(e,void 0,void 0).some(a=>{if(a.predicate?.value!==Ql)return!1;let o=a.object?.value;return ye.includes(o)||o==="Bookmark"||o==="bookmark:Bookmark"||typeof o=="string"&&/[#/]Bookmark$/.test(o)})}function Qt(e,...t){if(e){for(let n of t)if(e[n]!==void 0)return e[n]}}async function Zr(e,t,n,a){let o=e?.value,r=a;if(!r){n.innerHTML='<div class="empty">Failed to load bookmark</div>';return}let i=Qt(r,...Vr)||"",s=Qt(r,...Yr)||"",l=Qt(r,...td),p=te(l)||"",u=Qt(r,...nd),d=se(async()=>{let m=n.querySelector("#bm-title")?.value??i,g=n.querySelector("#bm-desc")?.value??s;i=m,s=g;let h=Vr.find(w=>r[w]!==void 0)||"dc:title",k=Yr.find(w=>r[w]!==void 0)||"dc:description";r[h]=m,r[k]=g,f("saving");try{await H(o.replace(/#.*$/,""),r),f("saved"),n.dispatchEvent(new CustomEvent("pane:change",{detail:{url:o,doc:r}}))}catch(w){f("err",w.message)}},600);ad(),n.innerHTML=`
    <div class="bm-card">
      <div class="bm-meta">
        <span><b style="color:var(--text)">Saved</b> \xB7 <span id="bm-status" class="bm-saved">in sync</span></span>
        ${u?`<span style="color:var(--text-faint)">${c(oe(u))}</span>`:""}
        <span style="color:var(--text-faint);font-family:var(--mono);font-size:11px;margin-left:auto">${c(o)}</span>
        <button class="btn danger" id="bm-del" title="Delete">${y.trash}</button>
      </div>
      <input class="bm-title" id="bm-title" value="${c(i)}" placeholder="Untitled bookmark" />
      ${p?`
        <a class="bm-link" href="${c(p)}" target="_blank" rel="noopener noreferrer">
          ${y.link} <span class="bm-link-url">${c(p)}</span>
        </a>
      `:""}
      <textarea class="bm-desc" id="bm-desc" placeholder="Description (optional)">${c(s)}</textarea>
    </div>
  `,n.querySelector("#bm-title").addEventListener("input",d),n.querySelector("#bm-desc").addEventListener("input",d),n.querySelector("#bm-del").addEventListener("click",async()=>{if(confirm(`Delete "${i||"this bookmark"}"?`))try{await ce(o.replace(/#.*$/,"")),x("Deleted","success"),n.dispatchEvent(new CustomEvent("pane:delete",{detail:{url:o}}))}catch(m){x("Delete failed: "+m.message,"error")}});function f(m,g){let h=n.querySelector("#bm-status");h&&(m==="saving"?(h.className="bm-saving",h.textContent="saving\u2026"):m==="saved"?(h.className="bm-saved",h.textContent="in sync"):m==="err"&&(h.className="bm-err",h.textContent="save error: "+(g||"")))}}function ad(){if(document.getElementById("bm-pane-css"))return;let e=document.createElement("style");e.id="bm-pane-css",e.textContent=`
.bm-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 12px; padding: 18px 20px; box-shadow: var(--shadow); }
.bm-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-dim); margin-bottom: 12px; }
.bm-saved { color: var(--good); }
.bm-saving { color: var(--warning); }
.bm-err { color: var(--danger); }
.bm-title { width: 100%; font: 600 22px/1.2 var(--sans); letter-spacing: -.01em; border: none; outline: none; background: transparent; color: var(--text); padding: 4px 0; margin-bottom: 6px; }
.bm-link { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 8px; color: var(--accent); text-decoration: none; font: 13px var(--mono); margin-bottom: 12px; transition: border-color .12s, background .12s; max-width: 100%; }
.bm-link:hover { border-color: var(--accent); background: var(--accent-soft); }
.bm-link svg { width: 14px; height: 14px; flex-shrink: 0; }
.bm-link-url { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bm-desc { width: 100%; min-height: 80px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; font: 14px/1.5 var(--sans); color: var(--text); outline: none; resize: vertical; transition: border-color .12s, box-shadow .12s; }
.bm-desc:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
`,document.head.appendChild(e)}var Ql,Zl,oa,ra,Gr,Xr,ed,Vr,Yr,td,nd,od,ei=S(()=>{D();M();Ql="http://www.w3.org/1999/02/22-rdf-syntax-ns#type",Zl="http://www.w3.org/2002/01/bookmark#",oa="http://purl.org/dc/elements/1.1/",ra="http://purl.org/dc/terms/",Gr="Bookmark",Xr="\u{1F516}",ed={id:"hub-pod/bookmark",name:"Bookmark",forClasses:ye};Vr=["dc:title","title",oa+"title",ra+"title","schema:name","name"],Yr=["dc:description","description",oa+"description",ra+"description","schema:description"],td=["bookmark:recalls","recalls",Zl+"recalls"],nd=["dc:created","dcterms:created","created",oa+"date",ra+"created","schema:dateCreated","dateCreated"];od={label:Gr,icon:Xr,canHandle:Qr,render:Zr}});var ca={};N(ca,{canHandle:()=>ri,default:()=>cd,icon:()=>oi,label:()=>ai,meta:()=>id,render:()=>ii});function ri(e,t){return e?.termType&&e.termType!=="NamedNode"||!t?.statementsMatching?!1:t.statementsMatching(e,void 0,void 0).some(a=>{if(a.predicate?.value!==rd)return!1;let o=a.object?.value;return rn.includes(o)||o==="Note"||o==="as:Note"||typeof o=="string"&&/[#/]Note$/.test(o)&&/activitystreams/i.test(o)})}function sa(e,...t){if(e){for(let n of t)if(e[n]!==void 0)return e[n]}}async function ii(e,t,n,a){let o=e?.value,r=a;if(!r){n.innerHTML='<div class="empty">Failed to load post</div>';return}let i=sa(r,...ti)||"",s=te(sa(r,...sd))||"",l=sa(r,...ld);dd(),p({name:ni(s)||"Anonymous",img:null}),s&&ie(s).then(f=>{f&&p({name:f.name||ni(s)||"Anonymous",img:f.img})}).catch(()=>{});function p(f){n.innerHTML=`
      <div class="post-card">
        <div class="post-head">
          ${Ue(f,"sm")}
          <div class="post-head-info">
            <div class="post-author">${c(f.name)}</div>
            ${s?`<div class="post-author-id">${c(s)}</div>`:""}
          </div>
          ${l?`<div class="post-time">${c(oe(l))}</div>`:""}
          <button class="btn danger" id="post-del" title="Delete">${y.trash}</button>
        </div>
        <textarea class="post-content" id="post-content" placeholder="Write a note\u2026">${c(i)}</textarea>
        <div class="post-foot">
          <span id="post-status" class="post-saved">in sync</span>
          <span style="margin-left:auto;color:var(--text-faint);font-family:var(--mono);font-size:11px">${c(o)}</span>
        </div>
      </div>
    `,n.querySelector("#post-content").addEventListener("input",u),n.querySelector("#post-del").addEventListener("click",async()=>{if(confirm("Delete this post?"))try{await ce(o.replace(/#.*$/,"")),x("Deleted","success"),n.dispatchEvent(new CustomEvent("pane:delete",{detail:{url:o}}))}catch(m){x("Delete failed: "+m.message,"error")}})}let u=se(async()=>{let f=n.querySelector("#post-content")?.value??i;if(f===i)return;i=f;let m=ti.find(g=>r[g]!==void 0)||"as:content";r[m]=f,d("saving");try{await H(o.replace(/#.*$/,""),r),d("saved"),n.dispatchEvent(new CustomEvent("pane:change",{detail:{url:o,doc:r}}))}catch(g){d("err",g.message)}},600);function d(f,m){let g=n.querySelector("#post-status");g&&(f==="saving"?(g.className="post-saving",g.textContent="saving\u2026"):f==="saved"?(g.className="post-saved",g.textContent="in sync"):f==="err"&&(g.className="post-err",g.textContent="save error: "+(m||"")))}}function ni(e){if(!e)return null;try{return new URL(e).hostname}catch{return null}}function dd(){if(document.getElementById("post-pane-css"))return;let e=document.createElement("style");e.id="post-pane-css",e.textContent=`
.post-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; box-shadow: var(--shadow); }
.post-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.post-head .ava { width: 36px; height: 36px; font-size: 13px; flex-shrink: 0; }
.post-head-info { flex: 1; min-width: 0; }
.post-author { font-weight: 600; font-size: 14px; color: var(--text); }
.post-author-id { font-size: 11px; color: var(--text-faint); font-family: var(--mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.post-time { font-size: 12px; color: var(--text-dim); flex-shrink: 0; }
.post-content { width: 100%; min-height: 96px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 8px; padding: 12px; font: 14px/1.5 var(--sans); color: var(--text); outline: none; resize: vertical; transition: border-color .12s, box-shadow .12s; }
.post-content:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.post-foot { display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 12px; }
.post-saved { color: var(--good); }
.post-saving { color: var(--warning); }
.post-err { color: var(--danger); }
`,document.head.appendChild(e)}var rd,la,da,ai,oi,id,ti,sd,ld,cd,si=S(()=>{D();M();rd="http://www.w3.org/1999/02/22-rdf-syntax-ns#type",la="https://www.w3.org/ns/activitystreams#",da="http://www.w3.org/ns/activitystreams#",ai="Post",oi="\u{1F4AC}",id={id:"hub-pod/post",name:"ActivityStreams Note",forClasses:rn};ti=["as:content","content",la+"content",da+"content"],sd=["as:attributedTo","attributedTo",la+"attributedTo",da+"attributedTo"],ld=["as:published","published",la+"published",da+"published"];cd={label:ai,icon:oi,canHandle:ri,render:ii}});var pa={};N(pa,{canHandle:()=>ci,default:()=>fd,icon:()=>di,label:()=>li,meta:()=>pd,render:()=>pi});function ci(e,t,n){return Array.isArray(n?.items)}async function pi(e,t,n,a,o){let r=a?.items||[],i=a?.layout||"grid",s=a?.empty,l=a?.onSelect;if(ud(),!r.length){n.innerHTML=`<div class="coll-empty">
      <div class="coll-empty-title">${c(s?.title||"Nothing here yet")}</div>
      ${s?.body?`<div class="coll-empty-body">${c(s.body)}</div>`:""}
    </div>`;return}let p=document.createElement("div");p.className=`coll coll-${i}`,n.appendChild(p),await Promise.all(r.map(async u=>{let d=document.createElement("div");d.className="coll-slot",l&&(d.style.cursor="pointer",d.addEventListener("click",()=>l(u))),p.appendChild(d);try{let f=o?.resolvePane?await o.resolvePane(u):o?.findPane?o.findPane(u):null;f?await f.render(u,d,o):d.innerHTML=`<div class="coll-fallback">
          <div class="coll-fallback-url">${c(u.url||"(no url)")}</div>
          <div class="coll-fallback-hint">No pane registered${u.forClass?` for ${c(u.forClass)}`:""}.</div>
        </div>`}catch(f){d.innerHTML=`<div class="coll-fallback err">
        <div class="coll-fallback-url">${c(u.url||"(no url)")}</div>
        <div class="coll-fallback-hint">Pane failed: ${c(f.message)}</div>
      </div>`}}))}function ud(){if(document.getElementById("coll-pane-css"))return;let e=document.createElement("style");e.id="coll-pane-css",e.textContent=`
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
`,document.head.appendChild(e)}var li,di,pd,fd,ui=S(()=>{M();li="Collection",di="\u{1F5C2}",pd={id:"hub-pod/collection",name:"Generic collection (grid/list)"};fd={label:li,icon:di,canHandle:ci,render:pi}});var xi=va(()=>{pt();M();D();Ma();Ja();Va();Xa();Qa();ao();ro();io();so();po();go();xo();et();G();hn();rr();ir();vr();yr();$r();Tr();Hr();Fr();Kr();ei();si();ui();G();localStorage.getItem("hubpod-use-pilot-tracker")==="1"&&ee(Yn);ee(Y(Vn,"hub-pod/tracker"));ee(Y(Xn,"hub-pod/list"));ee(Y(Qn,"hub-pod/note"));ee(Y(Zn,"hub-pod/event"));ee(Y(ea,"hub-pod/photo"));ee(Y(ta,"hub-pod/person"));ee(Y(na,"hub-pod/file"));ee(Y(aa,"hub-pod/container"));ee(Y(ia,"hub-pod/bookmark"));ee(Y(ca,"hub-pod/post"));ee(Y(pa,"hub-pod/collection"));[pn,vn,yn,bn,wn,_n,Cn,En,Tn,Sn,Nn,zn].forEach(e=>Ge(e));var Q={app:"home",profile:null},fi={get auth(){return ct()},switchApp:De,findPane:O,resolvePane:wt,fetch:(...e)=>(window.xlogin?.authFetch||fetch)(...e),subscribe:Ct};function vd(){let e=v("#rail"),t=pe();e.innerHTML=t.map((n,a)=>`
    <button class="rail-item ${n.meta.id===Q.app?"active":""}" data-app="${n.meta.id}" title="${c(n.meta.name)}">
      ${n.meta.icon}
      <span class="rail-tip">${c(n.meta.name)}${a<9?` <span class="kbd">${a+1}</span>`:""}</span>
    </button>
  `).join(""),T(".rail-item[data-app]").forEach(n=>n.addEventListener("click",()=>De(n.dataset.app)))}function md(){T(".rail-item[data-app]").forEach(e=>e.classList.toggle("active",e.dataset.app===Q.app))}function De(e){let t=ht(e);if(!t)return;Q.app=e,md(),history.replaceState(null,"","#"+e);let n=v("#sidebar"),a=v("#main");t.meta.hasSidebar&&t.sidebar?(n.style.display="flex",a.classList.remove("main-no-sidebar"),n.innerHTML=t.sidebar(fi)):(n.style.display="none",a.classList.add("main-no-sidebar")),v("#topbar-title").innerHTML=Q.app==="home"?"":`<span class="crumb">hub-pod</span> / ${c(t.meta.name)}`,Promise.resolve(t.render(a,fi)).catch(o=>{console.error("App render error:",o),a.innerHTML=`<div class="content"><div class="page-pad">
      <h1>Couldn't render ${c(t.meta.name)}</h1>
      <p class="lede" style="color:var(--danger)">${c(o.message)}</p>
    </div></div>`})}function gi(e){document.documentElement.setAttribute("data-theme",e),localStorage.setItem("hubpod-theme",e),gd(e)}function vi(){let e=document.documentElement.getAttribute("data-theme")||"dark";gi(e==="dark"?"light":"dark")}function gd(e){let t=v("#theme-icon");t&&(t.innerHTML=e==="light"?'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>':'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>')}async function hd(){let e=v("#auth-pill");if(!e)return;let t=ct();if(!t.loggedIn){e.innerHTML='<button class="btn primary" id="auth-login-btn">Sign in</button>',v("#auth-login-btn").addEventListener("click",()=>ya()),Q.profile=null;return}if(t.type==="solid"&&(!Q.profile||Q.profile["@id"]!==t.id))try{Q.profile=await ie(t.id)}catch{Q.profile=null}else t.type!=="solid"&&(Q.profile=null);let n=Q.profile?.name||xd(t.id)||yd(t.id)||"you",a=t.type==="solid"?"profile":"settings";e.innerHTML=`
    <span class="auth-pill" id="auth-pill-btn" title="${c(t.type)} session">
      <span class="ava">${Q.profile?.img?`<img src="${c(Q.profile.img)}" onerror="this.parentNode.textContent='${c($e(n))}'">`:c($e(n))}</span>
      <span class="name">${c(n)}</span>
      <span class="label">${t.type}</span>
    </span>
  `,v("#auth-pill-btn").addEventListener("click",()=>De(a))}function xd(e){try{return new URL(e).hostname}catch{return null}}function yd(e){return e?e.length>16?e.slice(0,6)+"\u2026"+e.slice(-4):e:null}function mi(){v("#spot-bg").classList.add("on"),setTimeout(()=>v("#spot-input").focus(),30),hi("")}function Zt(){v("#spot-bg").classList.remove("on"),v("#spot-input").value=""}function hi(e){let t=e.toLowerCase().trim(),n=pe().filter(a=>!t||a.meta.name.toLowerCase().includes(t));v("#spot-results").innerHTML=n.length?n.map(a=>`<div class="spot-r" data-app="${a.meta.id}">
        <div style="width:28px;height:28px;border-radius:7px;background:var(--bg-elev-2);display:grid;place-items:center;color:var(--text-dim)">${a.meta.icon}</div>
        <div style="flex:1"><div style="font-weight:500">${c(a.meta.name)}</div><div style="font-size:12px;color:var(--text-dim)">Open ${a.meta.name.toLowerCase()}</div></div>
      </div>`).join(""):`<div style="padding:30px;text-align:center;color:var(--text-faint);font-size:13px">No results for "${c(e)}"</div>`,T("#spot-results .spot-r").forEach((a,o)=>{o===0&&a.classList.add("sel"),a.addEventListener("click",()=>{De(a.dataset.app),Zt()})})}async function bd(){let e=localStorage.getItem("hubpod-theme")||"light";gi(e),await Promise.all([cn(),qa()]),v("#theme-btn").addEventListener("click",vi),v("#search-trigger").addEventListener("click",mi),v("#spot-bg").addEventListener("click",Zt),v("#spot-input").addEventListener("input",n=>hi(n.target.value)),v("#spot-input").addEventListener("keydown",n=>{if(n.key==="Escape")Zt();else if(n.key==="Enter"){let a=v("#spot-results .sel")||v("#spot-results .spot-r");a&&a.click()}else if(n.key==="ArrowDown"||n.key==="ArrowUp"){n.preventDefault();let a=T("#spot-results .spot-r"),o=a.findIndex(i=>i.classList.contains("sel")),r=n.key==="ArrowDown"?Math.min(a.length-1,o+1):Math.max(0,o-1);a.forEach(i=>i.classList.remove("sel")),a[r]&&(a[r].classList.add("sel"),a[r].scrollIntoView({block:"nearest"}))}}),document.addEventListener("keydown",n=>{if(!(n.target.tagName==="INPUT"||n.target.tagName==="TEXTAREA")){if((n.metaKey||n.ctrlKey)&&n.key.toLowerCase()==="k")n.preventDefault(),mi();else if(n.key==="Escape")Zt();else if(n.key.toLowerCase()==="t")vi();else if(n.key>="1"&&n.key<="9"){let a=pe()[+n.key-1];a&&De(a.meta.id)}}}),xa(async()=>{hd(),De(Q.app);let n=ct();if(n.loggedIn&&n.type==="solid"){try{let a=await Ze(n.id);a.changed&&confirm(`Your pod's installed apps list differs from this browser's cache.

Pod has: ${a.items.length} app${a.items.length===1?"":"s"}
Reload to apply the pod's list?`)&&window.location.reload()}catch(a){console.warn("apps sync from pod failed:",a)}try{await yt(n.id)}catch(a){console.warn("pane defaults sync from pod failed:",a)}}}),vd();let t=location.hash.replace("#","");De(ht(t)?t:"home"),setTimeout(()=>{localStorage.getItem("hubpod-seen")||(x("\u2318K to search \xB7 sign in via the floating button to use your pod"),localStorage.setItem("hubpod-seen","1"))},1e3)}bd()});var Td=va(()=>{ma();function wd(e){let t=document.createElement("style");t.setAttribute("data-source","hub-mashlib"),t.textContent=e,document.head.appendChild(t)}function kd(){if(document.querySelector('script[type="importmap"][data-source="hub-mashlib"]'))return;let e=document.createElement("script");e.type="importmap",e.setAttribute("data-source","hub-mashlib"),e.textContent=JSON.stringify({imports:{preact:"https://esm.sh/preact@10.19.0","preact/hooks":"https://esm.sh/preact@10.19.0/hooks",htm:"https://esm.sh/htm@3.1.1"}}),document.head.insertBefore(e,document.head.firstChild)}var _d="0.0.12";function $d(){return window.xlogin||document.querySelector('script[src*="xlogin"]')?Promise.resolve():new Promise(e=>{let t=document.createElement("script");t.src=`https://unpkg.com/xlogin@${_d}`,t.onload=()=>e(),t.onerror=()=>e(),document.head.appendChild(t)})}function Cd(){let e=document.getElementById("dataisland");if(!e)return null;let t=e.getAttribute("data-uri"),n=null;try{n=JSON.parse(e.textContent||"null")}catch{}return t?{uri:t,data:n}:null}function Ld(){let e=document.body;e.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <a href="https://github.com/solid-apps" class="brand-mark" title="solid-apps">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round">
              <path d="M10 13a5 5 0 0 1 0-7l3-3a5 5 0 0 1 7 7l-1.5 1.5"/>
              <path d="M14 11a5 5 0 0 1 0 7l-3 3a5 5 0 0 1-7-7l1.5-1.5"/>
            </svg>
          </a>
        </div>
        <div class="topbar-app-title" id="topbar-title"></div>
        <div class="topbar-actions">
          <button class="search-trigger" id="search-trigger" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span class="label">Search your pod</span>
            <span class="spacer"></span>
            <span class="kbd">\u2318K</span>
          </button>
          <button class="icon-btn" id="theme-btn" title="Toggle theme (T)" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="theme-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <span id="auth-pill"></span>
        </div>
      </header>
      <nav class="rail" id="rail"></nav>
      <aside class="sidebar" id="sidebar"></aside>
      <main class="main" id="main"></main>
    </div>
    <div class="spot-bg" id="spot-bg">
      <div class="spot" onclick="event.stopPropagation()">
        <div class="spot-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input class="spot-input" id="spot-input" placeholder="Search apps and items on your pod\u2026" autocomplete="off" />
          <span class="kbd">esc</span>
        </div>
        <div class="spot-results" id="spot-results"></div>
      </div>
    </div>
    <div class="toast" id="toast"></div>
  `,document.documentElement.setAttribute("data-theme",localStorage.getItem("hubpod-theme")||"light")}function Ed(){let e=location.pathname||"/";return e!=="/"&&e!==""&&!e.endsWith("/")?/\/profile/.test(e)?"profile":"resource":location.hash&&location.hash.length>1?null:e==="/"||e===""?"home":e.endsWith("/")?"files":null}function Sd(){return{meta:{id:"resource",name:"Resource",icon:"\u{1F4C4}",hasSidebar:!1},async render(e,t){let n=window.__hubMashlib;if(!n?.uri||!n.data){e.innerHTML='<div class="content"><div class="page-pad"><h1>No resource loaded</h1><p class="lede">Navigate to a JSON-LD resource URL to render it by @type.</p></div></div>';return}let a=n.data["@graph"]&&(Array.isArray(n.data["@graph"])?n.data["@graph"][0]:n.data["@graph"])||n.data,o=a?.["@type"],r=Array.isArray(o)?o[0]:o,i=r;typeof i=="string"&&i.startsWith("schema:")&&(i="https://schema.org/"+i.slice(7));let s={url:n.uri,doc:n.data,forClass:i},l=null;if(typeof t.resolvePane=="function")try{l=await t.resolvePane(s)}catch(p){console.warn("resolvePane threw:",p)}if(!l&&typeof t.findPane=="function")try{l=t.findPane(s)}catch(p){console.warn("findPane threw:",p)}if(!l){let p=u=>String(u??"").replace(/[&<>"']/g,d=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[d]);e.innerHTML=`<div class="content"><div class="page-pad">
          <h1>${p(r||"Resource")}</h1>
          <p class="lede">No pane registered for this @type. Raw JSON-LD:</p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px;overflow:auto;white-space:pre-wrap;word-break:break-word">${p(JSON.stringify(a,null,2))}</pre>
        </div></div>`;return}try{await Promise.resolve(l.render(s,e,t))}catch(p){e.innerHTML=`<div class="content"><div class="page-pad">Pane render failed: ${p.message}</div></div>`}}}}async function yi(){kd(),wd(ga),window.__hubMashlib=Cd(),Ld(),(await Promise.resolve().then(()=>(et(),Pa))).register(Sd());let t=Ed();t&&history.replaceState(null,"","#"+t),await $d(),await Promise.resolve().then(()=>Li(xi())),t&&t!=="home"&&requestAnimationFrame(()=>{document.querySelector(`.rail-item[data-app="${t}"]`)?.click()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",yi):yi()});export default Td();
