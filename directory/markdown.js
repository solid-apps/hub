/**
 * markdown.js — live markdown editor / preview.
 *
 * Two-pane: textarea on the left, rendered HTML on the right.
 * Hand-rolled minimal markdown parser (headings, bold, italic, code,
 * links, images, lists, blockquotes, hr) — no external library.
 * Persists draft to localStorage.
 */

export const meta = {
  id:         "demo-markdown",
  name:       "Markdown",
  icon:       "✍️",
  hasSidebar: false,
};

const KEY = "demo-markdown";
const SEED = `# Hello, markdown

This pane renders **markdown** as you type. Features supported:

- Headings \`# ## ### ####\`
- *italic*, **bold**, \`inline code\`
- [Links](https://solid-apps.github.io/hub/)
- Lists (bulleted and numbered)
- > Blockquotes
- Horizontal rules: ---
- Code blocks:

\`\`\`
function hello(name) {
  return "Hi, " + name;
}
\`\`\`

Try editing the left side.`;

export async function render(container, _ctx) {
  const initial = localStorage.getItem(KEY) || SEED;

  container.innerHTML = `
    <div class="content"><div style="height:100%;display:flex;flex-direction:column">
      <div style="padding:14px 22px;border-bottom:1px solid var(--line);display:flex;align-items:baseline;gap:14px">
        <h1 style="margin:0">Markdown</h1>
        <span style="color:var(--text-faint);font:12px var(--mono)" id="md-stat">—</span>
        <button class="btn" id="md-copy" style="margin-left:auto;font-size:12px">Copy HTML</button>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);overflow:hidden">
        <textarea id="md-input" spellcheck="false"
          style="background:var(--bg-elev);border:none;outline:none;padding:18px 22px;font:14px/1.6 var(--mono);color:var(--text);resize:none"
        ></textarea>
        <div id="md-output"
          style="background:var(--bg-elev);overflow-y:auto;padding:18px 22px;font:15px/1.6 var(--sans);color:var(--text)"
        ></div>
      </div>
    </div></div>
  `;

  const ta = container.querySelector("#md-input");
  const out = container.querySelector("#md-output");
  const stat = container.querySelector("#md-stat");
  const copyBtn = container.querySelector("#md-copy");

  injectMdStyles();

  ta.value = initial;
  update();

  ta.addEventListener("input", () => {
    localStorage.setItem(KEY, ta.value);
    update();
  });
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(out.innerHTML);
      copyBtn.textContent = "Copied ✓";
      setTimeout(() => copyBtn.textContent = "Copy HTML", 1200);
    } catch { copyBtn.textContent = "(blocked)"; }
  });

  function update() {
    out.innerHTML = renderMarkdown(ta.value);
    stat.textContent = `${ta.value.length} chars`;
  }
}

// Minimal markdown renderer — no library. Handles common cases.
function renderMarkdown(src) {
  // Escape, then walk by blocks.
  const esc = (s) => s.replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  const lines = src.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Code fence
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }
    // HR
    if (/^-{3,}\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    // Heading
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }
    // Unordered list
    if (/^[-*+]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) { buf.push(lines[i].replace(/^[-*+]\s+/, "")); i++; }
      out.push(`<ul>${buf.map(b => `<li>${inline(b)}</li>`).join("")}</ul>`);
      continue;
    }
    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\d+\.\s+/, "")); i++; }
      out.push(`<ol>${buf.map(b => `<li>${inline(b)}</li>`).join("")}</ol>`);
      continue;
    }
    // Blank line
    if (line.trim() === "") { i++; continue; }
    // Paragraph: gather contiguous non-special lines
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" &&
           !/^(#{1,6}\s|>|[-*+]\s|\d+\.\s|---|```)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");

  function inline(s) {
    s = esc(s);
    // Inline code first to protect contents from other patterns
    s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
    // Images ![alt](url)
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" />');
    // Links [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Bold ** or __
    s = s.replace(/(\*\*|__)([^\1]+?)\1/g, "<strong>$2</strong>");
    // Italic * or _
    s = s.replace(/(?<!\w)([*_])([^*_]+)\1(?!\w)/g, "<em>$2</em>");
    return s;
  }
}

function injectMdStyles() {
  if (document.getElementById("md-pane-css")) return;
  const s = document.createElement("style");
  s.id = "md-pane-css";
  s.textContent = `
#md-output h1, #md-output h2, #md-output h3, #md-output h4, #md-output h5, #md-output h6 { margin: 1.2em 0 .4em; font-weight: 600; }
#md-output h1 { font-size: 1.8em; letter-spacing: -0.01em; }
#md-output h2 { font-size: 1.4em; }
#md-output h3 { font-size: 1.15em; }
#md-output p { margin: 0.6em 0; }
#md-output ul, #md-output ol { margin: 0.6em 0; padding-left: 1.4em; }
#md-output li { margin: 0.2em 0; }
#md-output a { color: var(--accent); }
#md-output code { background: var(--bg-elev-2); padding: 1px 5px; border-radius: 4px; font: 0.92em var(--mono); }
#md-output pre { background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; overflow-x: auto; font: 13px/1.5 var(--mono); }
#md-output pre code { background: transparent; padding: 0; }
#md-output blockquote { border-left: 3px solid var(--line); padding-left: 12px; color: var(--text-dim); margin: 0.6em 0; }
#md-output hr { border: none; border-top: 1px solid var(--line); margin: 1.4em 0; }
#md-output img { max-width: 100%; border-radius: 6px; }
`;
  document.head.appendChild(s);
}
