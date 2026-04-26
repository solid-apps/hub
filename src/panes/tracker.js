/**
 * tracker.js — Tracker pane for wf:Tracker.
 *
 * Originally vendored from solid-apps/pilot's tracker-pane.js
 * (https://solid-apps.github.io/pilot/tracker-pane.js, AGPL-3.0).
 * Hub ships its own copy so the pane can evolve independently — edits
 * here don't affect pilot, and vice versa. Both start byte-identical.
 *
 * Implements the SolidOS tracker shape convention #1: one JSON-LD file
 * per tracker with an embedded `issue: [...]` array of Vtodo objects.
 *
 * Renders one tracker as a kanban column with full read/write CRUD:
 * add / toggle / edit / delete / drag-drop tasks. Edits PUT back to
 * the resource via xlogin.authFetch. Cross-instance drag works because
 * trackerBus is module-level — multiple Tracker panes on the same page
 * get between-column moves for free.
 *
 * Exports the LOSOS pane interface: canHandle(subject, store) +
 * render(subject, store, container, rawData). app.js wraps this with
 * panes.adapt() so the hub registry sees a hub-shaped pane.
 *
 * AGPL-3.0
 */


// Imports use bare specifiers — the consuming page must provide an
// <script type="importmap"> mapping "preact", "preact/hooks", and "htm".
// Pilot ships such a map; LOSOS host apps need to add one (or use a
// browser polyfill) to embed this pane.
import { h, render as preactRender } from 'preact'
import { useState, useEffect, useCallback, useRef } from 'preact/hooks'
import htm from 'htm'

const html = htm.bind(h)

// --- input parser (hub-only) -----------------------------------------------
// Hub's tracker accepts a todo.txt-flavoured input syntax:
//   "Buy milk #shopping !high"  →  summary "Buy milk", category ["shopping"], priority "high"
// !1 / !2 / !3 are aliases for high / medium / low. Tags persist as
// `category` (real ical:Vtodo property), priority as `priority` string.

function parseTaskInput(text) {
  const tags = []
  let priority = null
  let summary = String(text || '')
    .replace(/#([\w-]+)/g, (_, tag) => { tags.push(tag.toLowerCase()); return '' })
    .replace(/!(?:high|h)\b/gi,        () => { priority = 'high';   return '' })
    .replace(/!(?:medium|med|m)\b/gi,  () => { priority = 'medium'; return '' })
    .replace(/!(?:low|l)\b/gi,         () => { priority = 'low';    return '' })
    .replace(/!([123])\b/g, (_, n) => {
      priority = n === '1' ? 'high' : n === '2' ? 'medium' : 'low'
      return ''
    })
    .replace(/\s+/g, ' ')
    .trim()
  if (!summary) summary = '(untitled)'
  // Dedup tags
  const dedup = [...new Set(tags)]
  return { summary, category: dedup, priority }
}

// Render a parsed task back to its raw string — used when entering edit
// mode so the user sees their tags and priority and can re-edit them.
function composeRaw(issue) {
  let s = issue.summary || ''
  const cats = Array.isArray(issue.category) ? issue.category : (issue.category ? [issue.category] : [])
  if (cats.length) s += ' ' + cats.map(c => '#' + c).join(' ')
  if (issue.priority === 'high')   s += ' !high'
  if (issue.priority === 'medium') s += ' !med'
  if (issue.priority === 'low')    s += ' !low'
  return s.trim()
}

// --- pod fetch + write -----------------------------------------------------

const fetcher = () => (window.xlogin && window.xlogin.authFetch) || fetch

async function fetchJsonLd(url) {
  const r = await fetcher()(url, { headers: { Accept: 'application/ld+json' } })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  return r.json()
}

async function putJsonLd(url, body) {
  const r = await fetcher()(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/ld+json' },
    body: JSON.stringify(body, null, 2),
  })
  if (!r.ok) throw new Error(`PUT failed: ${r.status} ${r.statusText}`)
  return r
}

// --- one-tracker state with optimistic edits + debounced PUT ---------------

export function useTracker(url, initialDoc) {
  const [state, setState] = useState({
    loading: !initialDoc && !!url,
    doc: initialDoc || null,
    error: null,
    status: '',
  })
  const saveTimer = useRef(null)

  useEffect(() => {
    if (initialDoc || !url) return
    let cancelled = false
    fetchJsonLd(url.replace(/#.*$/, ''))
      .then(doc => { if (!cancelled) setState(s => ({ ...s, loading: false, doc })) })
      .catch(err => { if (!cancelled) setState(s => ({ ...s, loading: false, error: err.message })) })
    return () => { cancelled = true }
  }, [url, initialDoc])

  const scheduleSave = useCallback((doc) => {
    if (!url) return
    setState(s => ({ ...s, status: 'saving' }))
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      putJsonLd(url.replace(/#.*$/, ''), doc)
        .then(() => setState(s => ({ ...s, status: 'saved' })))
        .catch(err => setState(s => ({ ...s, status: 'error', error: err.message })))
    }, 500)
  }, [url])

  const mutate = useCallback((fn) => {
    setState(s => {
      if (!s.doc) return s
      const next = fn(s.doc)
      scheduleSave(next)
      return { ...s, doc: next, status: 'saving' }
    })
  }, [scheduleSave])

  const issuesOf = (d) => Array.isArray(d.issue) ? d.issue : (d.issue ? [d.issue] : [])
  const setIssues = (d, xs) => ({ ...d, issue: xs })
  const nowIso = () => new Date().toISOString()
  const insertAt = (xs, issue, beforeId) => {
    const filtered = xs.filter(x => x['@id'] !== issue['@id'])
    if (!beforeId) return [...filtered, issue]
    const idx = filtered.findIndex(x => x['@id'] === beforeId)
    if (idx < 0) return [...filtered, issue]
    return [...filtered.slice(0, idx), issue, ...filtered.slice(idx)]
  }

  return {
    ...state,
    addIssue:    (raw)             => mutate(d => {
      const parsed = parseTaskInput(raw)
      const issue = {
        '@id': `#Iss${Date.now()}`,
        '@type': d.issue?.[0]?.['@type'] || 'Vtodo',
        summary: parsed.summary,
        status: d.initialState || 'NEEDS-ACTION',
        created: nowIso(), modified: nowIso(),
      }
      if (parsed.category.length) issue.category = parsed.category
      if (parsed.priority) issue.priority = parsed.priority
      return setIssues(d, [...issuesOf(d), issue])
    }),
    toggleIssue: (id)              => mutate(d => setIssues(d, issuesOf(d).map(it => it['@id'] === id
      ? { ...it, status: it.status === 'COMPLETED' ? 'NEEDS-ACTION' : 'COMPLETED', modified: nowIso() } : it))),
    editIssue:   (id, raw)         => mutate(d => setIssues(d, issuesOf(d).map(it => {
      if (it['@id'] !== id) return it
      const parsed = parseTaskInput(raw)
      const next = { ...it, summary: parsed.summary, modified: nowIso() }
      if (parsed.category.length) next.category = parsed.category; else delete next.category
      if (parsed.priority) next.priority = parsed.priority; else delete next.priority
      return next
    }))),
    deleteIssue: (id)              => mutate(d => setIssues(d, issuesOf(d).filter(it => it['@id'] !== id))),
    setTitle:    (title)           => mutate(d => ({ ...d, title })),
    addExisting: (issue, beforeId) => mutate(d => setIssues(d, insertAt(issuesOf(d), { ...issue, modified: nowIso() }, beforeId))),
    moveWithin:  (id, beforeId)    => mutate(d => {
      const xs = issuesOf(d)
      const it = xs.find(x => x['@id'] === id)
      if (!it) return d
      return setIssues(d, insertAt(xs, it, beforeId))
    }),
    getIssue:    (id)              => issuesOf(state.doc || {}).find(x => x['@id'] === id),
  }
}

// Module-level bus so a drop on tracker T can call mutators on tracker S
// without prop-drilling. Cross-pane on the same page works automatically.
export const trackerBus = new Map()

// --- presentational components --------------------------------------------

export function IssueRow({ issue, trackerUrl, onToggle, onEdit, onDelete, onTagClick }) {
  const [editing, setEditing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select() } }, [editing])
  const done = issue.status === 'COMPLETED'
  const raw = composeRaw(issue)
  const cats = Array.isArray(issue.category) ? issue.category : (issue.category ? [issue.category] : [])
  const commit = () => { const v = inputRef.current.value.trim(); if (v && v !== raw) onEdit(v); setEditing(false) }
  const onDragStart = (e) => {
    e.dataTransfer.setData('application/x-tracker-pane-issue', JSON.stringify({ trackerUrl, issueId: issue['@id'] }))
    e.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }
  const tagClick = (e, t) => { e.stopPropagation(); onTagClick?.(t) }
  return html`
    <div class=${'tp-issue ' + (done ? 'tp-done ' : '') + (dragging ? 'tp-dragging ' : '')}
         draggable=${!editing}
         data-issue-id=${issue['@id']}
         onDragStart=${onDragStart}
         onDragEnd=${() => setDragging(false)}>
      <div class=${'tp-check ' + (done ? 'tp-on' : '')} onClick=${onToggle}>${done ? '\u2713' : ''}</div>
      ${editing
        ? html`<div class="tp-summary tp-editing"><input ref=${inputRef} defaultValue=${raw} onBlur=${commit} onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); commit() } if (e.key === 'Escape') { e.preventDefault(); setEditing(false) } }} /></div>`
        : html`<div class="tp-summary" onClick=${() => setEditing(true)}>
            ${issue.summary || '(untitled)'}
            ${cats.map(t => html`<span class="tp-tag" title=${'Filter by #' + t} onClick=${(e) => tagClick(e, t)}>#${t}</span>`)}
          </div>`}
      ${issue.priority ? html`<span class=${'tp-pri tp-pri-' + issue.priority} title=${'Priority: ' + issue.priority}>${issue.priority[0].toUpperCase()}</span>` : ''}
      <div class="tp-del" title="Delete" onClick=${onDelete}>\u00d7</div>
    </div>`
}

export function TrackerColumn({ url, initialDoc, hideCompleted }) {
  const t = useTracker(url, initialDoc)
  const [draft, setDraft] = useState('')
  const [dropOver, setDropOver] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')      // 'all' | 'open' | 'done'
  const [tagFilter, setTagFilter] = useState(null)
  const titleInputRef = useRef(null)
  const submit = (e) => { e?.preventDefault?.(); const v = draft.trim(); if (!v) return; t.addIssue(v); setDraft('') }
  useEffect(() => { injectStyles() }, [])
  useEffect(() => { if (editingTitle && titleInputRef.current) { titleInputRef.current.focus(); titleInputRef.current.select() } }, [editingTitle])

  const commitTitle = () => {
    const v = titleInputRef.current?.value.trim()
    if (v && v !== (t.doc?.title || '')) t.setTitle(v)
    setEditingTitle(false)
  }

  useEffect(() => {
    if (!url) return
    trackerBus.set(url, {
      addExisting: t.addExisting, deleteIssue: t.deleteIssue,
      moveWithin:  t.moveWithin,  getIssue:    t.getIssue,
    })
    return () => { trackerBus.delete(url) }
  }, [url, t.addExisting, t.deleteIssue, t.moveWithin, t.getIssue])

  const beforeIdFromEvent = (e) => {
    const row = e.target.closest?.('.tp-issue[data-issue-id]')
    return row ? row.getAttribute('data-issue-id') : null
  }
  const onDragOver = (e) => {
    if (!e.dataTransfer.types.includes('application/x-tracker-pane-issue')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropOver(true)
  }
  const onDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setDropOver(false)
  }
  const onDrop = (e) => {
    e.preventDefault(); setDropOver(false)
    let payload
    try { payload = JSON.parse(e.dataTransfer.getData('application/x-tracker-pane-issue')) } catch { return }
    if (!payload?.issueId) return
    const beforeId = beforeIdFromEvent(e)
    if (payload.trackerUrl === url) {
      t.moveWithin(payload.issueId, beforeId)
    } else {
      const src = trackerBus.get(payload.trackerUrl)
      if (!src) return
      const issue = src.getIssue(payload.issueId)
      if (!issue) return
      t.addExisting(issue, beforeId); src.deleteIssue(payload.issueId)
    }
  }

  if (t.loading) return html`<div class="tp-col"><div class="tp-col-head"><div class="tp-col-title">Loading\u2026</div></div></div>`
  if (t.error && !t.doc) return html`<div class="tp-col"><div class="tp-col-head"><div class="tp-col-title">Error</div></div><div class="tp-err">${t.error}</div></div>`
  const doc = t.doc || {}
  const allIssues = Array.isArray(doc.issue) ? doc.issue : (doc.issue ? [doc.issue] : [])
  const open = allIssues.filter(i => i.status !== 'COMPLETED').length
  // Filters: hideCompleted prop still honoured; status/tag filter overlays.
  const allTags = [...new Set(allIssues.flatMap(i =>
    Array.isArray(i.category) ? i.category : (i.category ? [i.category] : [])
  ))]
  const visible = allIssues.filter(i => {
    if (hideCompleted && i.status === 'COMPLETED') return false
    if (statusFilter === 'open' && i.status === 'COMPLETED') return false
    if (statusFilter === 'done' && i.status !== 'COMPLETED') return false
    if (tagFilter) {
      const cats = Array.isArray(i.category) ? i.category : (i.category ? [i.category] : [])
      if (!cats.includes(tagFilter)) return false
    }
    return true
  })
  return html`
    <div class=${'tp-col ' + (dropOver ? 'tp-drop-over' : '')}
         onDragOver=${onDragOver} onDragLeave=${onDragLeave} onDrop=${onDrop}>
      <div class="tp-col-head">
        ${editingTitle
          ? html`<input ref=${titleInputRef} class="tp-col-title-input"
              defaultValue=${doc.title || ''}
              onBlur=${commitTitle}
              onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); commitTitle() } if (e.key === 'Escape') { e.preventDefault(); setEditingTitle(false) } }} />`
          : html`<div class="tp-col-title" title="Click to rename" onClick=${() => setEditingTitle(true)}>${doc.title || (url || '').split('/').pop()}</div>`}
        <div class="tp-col-count">${open}/${allIssues.length}</div>
        ${t.status && html`<div class=${'tp-col-status tp-' + t.status}>${t.status === 'saving' ? '\u2026 saving' : t.status === 'saved' ? '\u2713 saved' : '\u26a0 ' + (t.error || 'error')}</div>`}
      </div>
      <div class="tp-filters">
        <button class=${'tp-chip ' + (statusFilter === 'all'  ? 'tp-on' : '')} onClick=${() => setStatusFilter('all')}>All</button>
        <button class=${'tp-chip ' + (statusFilter === 'open' ? 'tp-on' : '')} onClick=${() => setStatusFilter('open')}>Open</button>
        <button class=${'tp-chip ' + (statusFilter === 'done' ? 'tp-on' : '')} onClick=${() => setStatusFilter('done')}>Done</button>
        ${allTags.map(tg => html`<button
          class=${'tp-chip tp-tag-chip ' + (tagFilter === tg ? 'tp-on' : '')}
          onClick=${() => setTagFilter(tagFilter === tg ? null : tg)}>#${tg}</button>`)}
        ${visible.length !== allIssues.length && html`<span class="tp-filter-count">${visible.length} shown</span>`}
      </div>
      <div class="tp-issues">
        ${visible.map(it => html`<${IssueRow} key=${it['@id']} issue=${it} trackerUrl=${url}
          onToggle=${() => t.toggleIssue(it['@id'])}
          onEdit=${(v) => t.editIssue(it['@id'], v)}
          onDelete=${() => t.deleteIssue(it['@id'])}
          onTagClick=${(tg) => setTagFilter(tagFilter === tg ? null : tg)} />`)}
      </div>
      ${url && html`<form class="tp-add-row" onSubmit=${submit}>
        <input type="text" placeholder="+ add task \u2014 type #tag and !high/!med/!low" value=${draft} onInput=${(e) => setDraft(e.target.value)} />
      </form>`}
    </div>`
}

// --- styles (injected once per page, namespaced under .tp-) ----------------

function injectStyles() {
  if (document.getElementById('tracker-pane-css')) return
  const s = document.createElement('style')
  s.id = 'tracker-pane-css'
  // Theme-aware: every colour reads from hub-pod's CSS variables in style.css,
  // so the pane works in both light and dark themes and inherits the accent.
  s.textContent = `
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
`
  document.head.appendChild(s)
}

// --- the LOSOS pane interface ----------------------------------------------

function typeOf(subject, store) {
  if (!store || !subject) return null
  const id = (subject && typeof subject === 'object') ? subject.value : subject
  const node = store.get?.(id)
  if (node === undefined && !store.type) return null
  return store.type ? store.type(node !== undefined ? node : id) : null
}

function isTrackerType(t) {
  if (!t) return false
  const arr = Array.isArray(t) ? t : [t]
  return arr.some(x => typeof x === 'string' && /(^|[#:/])Tracker$/i.test(x))
}

export const label = 'Tasks'
export const icon  = '\u2705'

export function canHandle(subject, store) {
  return isTrackerType(typeOf(subject, store))
}

export function render(subject, store, container, rawData) {
  injectStyles()
  // Resource URL for PUTs: take the data island src if present, else the
  // subject's value (if it has http(s) scheme), else null (read-only).
  const dataEl = document.querySelector('script[type="application/ld+json"]')
  const src = dataEl?.getAttribute('src')
  const subjectVal = subject?.value || ''
  const url = src
    ? new URL(src, window.location.href).href
    : (/^https?:\/\//.test(subjectVal) ? subjectVal.replace(/#.*$/, '') : null)
  preactRender(h(TrackerColumn, { url, initialDoc: rawData || null }), container)
}

export default { label, icon, canHandle, render }
