/**
 * Home — dashboard pulling recent items from across apps.
 *
 * No persistent state of its own. Reads:
 *   - WebID profile (for greeting)
 *   - Recent notes from /hub/notes/
 *   - Open tasks from /hub/tasks/list.jsonld
 *   - Upcoming events from /hub/calendar/
 */

import { fetchWebIdProfile, listContainer, getJsonLd, hubRoot, discoverStorage, fetchTypeIndex, findRegistrations, TRACKER_CLASS, NOTE_CLASSES, CALENDAR_CLASSES, IMAGE_CLASSES } from "../pod.js";
import { ICON, escape, fmtRel, $, $$, avatarHTML } from "../ui.js";

export async function render(container, ctx) {
  if (ctx.auth.type !== "solid") {
    const isNostr = ctx.auth.type === "nostr";
    container.innerHTML = `
      <div class="content"><div class="page-pad">
        <h1>Welcome to <span style="background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent">hub-pod</span></h1>
        <p class="lede">A multi-app workspace backed by your Solid pod. Profile, Files, Calendar, Contacts, Notes, Tasks, Photos — all stored as JSON-LD on a pod you own.</p>

        <div class="login-banner">
          <div class="ico">${ICON.user}</div>
          <div class="info">
            <strong>${isNostr ? "Signed in via Nostr — Solid required" : "Sign in to get started."}</strong>
            <span>${isNostr
              ? "hub-pod stores its data on a Solid pod. Click the floating Login button, log out, then sign in again on the Solid tab."
              : "Click the floating Login button (bottom-right). xlogin handles Solid OIDC for you — pick your provider and you're in."}</span>
          </div>
        </div>

        <div class="widgets" style="margin-top:14px">
          ${["profile","files","calendar","contacts","notes","tasks","photos"].map(id => `
            <div class="widget w-4">
              <h3>${appIcon(id)} ${capitalize(id)}</h3>
              <div style="color:var(--text-dim);font-size:13px">${appBlurb(id)}</div>
            </div>
          `).join("")}
        </div>
      </div></div>
    `;
    return;
  }

  container.innerHTML = `<div class="content"><div class="page-pad" id="home-page">
    <div class="spinner"></div>
  </div></div>`;
  const page = $("#home-page");

  let profile = null;
  let storage = null;
  try {
    profile = await fetchWebIdProfile(ctx.auth.id);
    storage = await discoverStorage(ctx.auth.id);
  } catch (e) {
    profile = null;
  }

  const greeting = greetingHour();
  const name = profile?.name?.split(" ")?.[0] || "there";

  page.innerHTML = `
    <h1>${escape(greeting)}, <span style="background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent">${escape(name)}</span></h1>
    <p class="lede">Your pod is at <code style="color:var(--accent)">${escape(storage || "(unknown)")}</code></p>

    <div class="widgets">
      <div class="widget w-6">
        <h3>${ICON.tasks} Open tasks <a class="more" data-go="tasks">All →</a></h3>
        <div id="home-tasks"><div class="spinner"></div></div>
      </div>

      <div class="widget w-6">
        <h3>${ICON.calendar} Upcoming events <a class="more" data-go="calendar">Calendar →</a></h3>
        <div id="home-events"><div class="spinner"></div></div>
      </div>

      <div class="widget w-12">
        <h3>${ICON.notes} Recent notes <a class="more" data-go="notes">All →</a></h3>
        <div id="home-notes"><div class="spinner"></div></div>
      </div>

      <div class="widget w-6">
        <h3>${ICON.user} Profile <a class="more" data-go="profile">Edit →</a></h3>
        <div style="display:flex;gap:14px;align-items:center">
          ${avatarHTML(profile, "")}
          <div>
            <div style="font-weight:500">${escape(profile?.name || "(no name yet)")}</div>
            <div style="color:var(--text-dim);font-size:13px">${escape(profile?.email || profile?.nick || "")}</div>
            <div style="color:var(--text-faint);font-family:var(--mono);font-size:11px;margin-top:4px;word-break:break-all">${escape(ctx.auth.id)}</div>
          </div>
        </div>
      </div>

      <div class="widget w-6">
        <h3>${ICON.files} Pod stats <a class="more" data-go="files">Browse →</a></h3>
        <div id="home-pod" style="display:flex;flex-direction:column;gap:8px">
          <div style="color:var(--text-dim);font-size:13px">Pod root: <code style="color:var(--text)">${escape(storage || "")}</code></div>
          <div id="home-pod-stats" style="color:var(--text-faint);font-size:13px">Counting…</div>
        </div>
      </div>
    </div>
  `;

  $$("[data-go]").forEach(el => el.addEventListener("click", () => ctx.switchApp(el.dataset.go)));

  loadHomeTasks(ctx);
  loadHomeEvents(ctx);
  loadHomeNotes(ctx);
  loadHomeStats(ctx);
}

async function loadHomeTasks(ctx) {
  // Discover trackers via TypeIndex (matches the Tasks app), aggregate open
  // todos across all of them.
  const list = $("#home-tasks");
  if (!list) return;
  try {
    const ti = await fetchTypeIndex(ctx.auth.id);
    const regs = findRegistrations(ti, TRACKER_CLASS).filter(r => r.instance);
    if (!regs.length) {
      list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">No trackers registered in your TypeIndex yet.</div>`;
      return;
    }
    const docs = await Promise.all(regs.map(r =>
      getJsonLd(r.instance.replace(/#.*$/, "")).catch(() => null)
    ));
    const open = [];
    docs.forEach((doc, i) => {
      if (!doc?.issue) return;
      const trackerLabel = (regs[i].instance || "").split("/").pop().split("#")[0]
        .replace(/-data\.jsonld$/, "").replace(/\.jsonld$/, "");
      doc.issue.forEach(t => {
        if (t.status !== "completed") open.push({ ...t, _tracker: trackerLabel });
      });
    });
    if (!open.length) {
      list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">All trackers are inbox zero. 🎯</div>`;
      return;
    }
    list.innerHTML = open.slice(0, 6).map(t => `
      <div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:14px">
        <span style="width:14px;height:14px;border:2px solid var(--text-faint);border-radius:4px;flex-shrink:0"></span>
        <span style="flex:1">${escape(t.summary || "(untitled)")}</span>
        <span style="font-size:11px;color:var(--text-faint);font-family:var(--mono)">${escape(t._tracker)}</span>
      </div>
    `).join("");
    if (open.length > 6) {
      list.innerHTML += `<div style="color:var(--text-faint);font-size:12px;margin-top:6px">+${open.length - 6} more</div>`;
    }
  } catch (e) {
    list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">${escape(e.message || "Couldn't load tasks.")}</div>`;
  }
}

async function loadHomeEvents(ctx) {
  const list = $("#home-events");
  if (!list) return;
  try {
    const ti = await fetchTypeIndex(ctx.auth.id);
    const regs = ti.registrations.filter(r => CALENDAR_CLASSES.includes(r.forClass) && (r.instance || r.instanceContainer));
    if (!regs.length) {
      list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">No calendar registered.</div>`;
      return;
    }
    const events = [];
    await Promise.all(regs.map(async r => {
      if (r.instanceContainer) {
        const items = await listContainer(r.instanceContainer).catch(() => []);
        await Promise.all(items
          .filter(it => it.type === "resource" && /\.jsonld$/.test(it.url))
          .map(async it => {
            const d = await getJsonLd(it.url).catch(() => null);
            if (d?.dtstart) events.push(d);
          }));
      } else if (r.instance) {
        const d = await getJsonLd(r.instance.replace(/#.*$/, "")).catch(() => null);
        if (d?.dtstart) events.push(d);
      }
    }));
    const now = new Date();
    const upcoming = events
      .filter(d => new Date(d.dtstart) >= now)
      .sort((a, b) => a.dtstart.localeCompare(b.dtstart))
      .slice(0, 4);
    if (!upcoming.length) {
      list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">Nothing scheduled.</div>`;
      return;
    }
    list.innerHTML = upcoming.map(d => {
      const dt = new Date(d.dtstart);
      return `<div style="display:flex;gap:10px;padding:6px 0;font-size:14px;align-items:baseline">
        <span style="font-family:var(--mono);font-size:12px;color:var(--text-dim);min-width:88px">${dt.toLocaleDateString("en-GB",{day:"numeric",month:"short"})} ${dt.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
        <span>${escape(d.summary || "(event)")}</span>
      </div>`;
    }).join("");
  } catch {
    list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">No events yet.</div>`;
  }
}

async function loadHomeNotes(ctx) {
  const list = $("#home-notes");
  if (!list) return;
  try {
    const ti = await fetchTypeIndex(ctx.auth.id);
    const regs = ti.registrations.filter(r => NOTE_CLASSES.includes(r.forClass) && (r.instance || r.instanceContainer));
    if (!regs.length) {
      list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">No notebooks registered.</div>`;
      return;
    }
    const notes = [];
    await Promise.all(regs.map(async r => {
      if (r.instanceContainer) {
        const items = await listContainer(r.instanceContainer).catch(() => []);
        await Promise.all(items
          .filter(it => it.type === "resource" && /\.jsonld$/.test(it.url))
          .map(async it => {
            const d = await getJsonLd(it.url).catch(() => null);
            if (d?.headline || d?.text) notes.push(d);
          }));
      } else if (r.instance) {
        const d = await getJsonLd(r.instance.replace(/#.*$/, "")).catch(() => null);
        if (d) notes.push(d);
      }
    }));
    const recent = notes.sort((a, b) =>
      (b.datePublished || "").localeCompare(a.datePublished || "")
    ).slice(0, 3);
    if (!recent.length) {
      list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">No notes yet.</div>`;
      return;
    }
    list.innerHTML = recent.map(d => `
      <div style="padding:10px 12px;background:var(--bg-elev-2);border-radius:8px;margin-bottom:6px">
        <div style="font-weight:500;font-size:14px">${escape(d.headline || "(untitled)")}</div>
        <div style="color:var(--text-dim);font-size:12px;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escape((d.text || "").replace(/[\n#*`>]/g, " ").slice(0, 140))}</div>
        <div style="color:var(--text-faint);font-size:11px;font-family:var(--mono);margin-top:6px">${escape(fmtRel(d.datePublished))}</div>
      </div>
    `).join("");
  } catch {
    list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">No notes yet.</div>`;
  }
}

async function loadHomeStats(ctx) {
  // All four stats now come from TypeIndex registrations.
  const el = $("#home-pod-stats");
  if (!el) return;
  try {
    const ti = await fetchTypeIndex(ctx.auth.id);
    const countContainerOrInstance = async (regs, predicate) => {
      let n = 0;
      await Promise.all(regs.map(async r => {
        if (r.instanceContainer) {
          const items = await listContainer(r.instanceContainer).catch(() => []);
          n += items.filter(i => i.type === "resource" && (!predicate || predicate(i.url))).length;
        } else if (r.instance) {
          n += 1;
        }
      }));
      return n;
    };
    const noteRegs  = ti.registrations.filter(r => NOTE_CLASSES.includes(r.forClass));
    const evtRegs   = ti.registrations.filter(r => CALENDAR_CLASSES.includes(r.forClass));
    const imgRegs   = ti.registrations.filter(r => IMAGE_CLASSES.includes(r.forClass));
    const trkRegs   = ti.registrations.filter(r => r.forClass === TRACKER_CLASS && r.instance);

    const tasksPromise = (async () => {
      const docs = await Promise.all(trkRegs.map(r => getJsonLd(r.instance.replace(/#.*$/, "")).catch(() => null)));
      return docs.reduce((sum, d) => sum + (d?.issue?.length || 0), 0);
    })();

    const [notes, tasks, events, photos] = await Promise.all([
      countContainerOrInstance(noteRegs, url => /\.jsonld$/.test(url)),
      tasksPromise,
      countContainerOrInstance(evtRegs, url => /\.jsonld$/.test(url)),
      countContainerOrInstance(imgRegs, url => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(url)),
    ]);
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${notes}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">notes</div></div>
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${tasks}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">tasks</div></div>
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${events}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">events</div></div>
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${photos}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">photos</div></div>
      </div>`;
  } catch {
    el.innerHTML = `<div style="color:var(--text-faint);font-size:13px">No TypeIndex available.</div>`;
  }
}

function greetingHour() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function appIcon(id) {
  return ICON[id === "profile" ? "user" : id] || ICON.home;
}
function capitalize(s) { return s[0].toUpperCase() + s.slice(1); }
function appBlurb(id) {
  return ({
    profile: "Read and edit your WebID profile in place.",
    files: "Browse the LDP containers under your pod's storage root.",
    calendar: "iCal-style events stored as JSON-LD.",
    contacts: "FOAF friends, resolved live from their WebIDs.",
    notes: "Markdown notes, one resource per note.",
    tasks: "Kanban tracker — same shape as SolidOS' tracker-pane.",
    photos: "A gallery rendered straight from your pod.",
  })[id] || "";
}

export const meta = { name: "Home", icon: ICON.home, hasSidebar: false };
