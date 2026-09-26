// Genera les fitxes docents en HTML (dist/fitxes/<idioma>/) a partir de docs/fitxes/<idioma>/*.md.
// Font unica: el markdown de docs/. Sense dependencies: converteix el subconjunt de markdown
// que usen les fitxes (titols, taules, llistes, negreta, cursiva, codi, enllacos, paragrafs).
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'docs', 'fitxes');
const out = join(root, 'dist', 'fitxes');

const LANGS = {
  ca: {
    index: 'Fitxes docents',
    intro: 'Guies per al professorat dels reptes de Blocs Junior: objectiu, desenvolupament de la sessió, solució, errors habituals i avaluació. Es poden imprimir en A4.',
    open: 'Obrir la plantilla',
    print: 'Imprimir',
    back: 'Totes les fitxes',
    app: 'Tornar a Blocs Junior',
    other: 'Castellano',
  },
  es: {
    index: 'Fichas docentes',
    intro: 'Guías para el profesorado de los desafíos de Blocs Junior: objetivo, desarrollo de la sesión, solución, errores habituales y evaluación. Se pueden imprimir en A4.',
    open: 'Abrir la plantilla',
    print: 'Imprimir',
    back: 'Todas las fichas',
    app: 'Volver a Blocs Junior',
    other: 'Valencià',
  },
};
const OTHER = { ca: 'es', es: 'ca' };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline (s) {
  const codes = [];
  s = esc(s).replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[i]}</code>`);
}

function frontMatter (text) {
  const meta = {};
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { meta, body: text };
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: text.slice(m[0].length) };
}

function markdown (md) {
  const lines = md.split('\n');
  const html = [];
  let i = 0;
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { html.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (line.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++]);
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      const emptyHead = head.every((c) => !c);
      let t = `<table${emptyHead ? ' class="meta"' : ''}>`;
      if (!emptyHead) t += '<thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead>';
      t += '<tbody>' + body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
      html.push(t);
      continue;
    }
    const li = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const tag = /\d/.test(li[2]) ? 'ol' : 'ul';
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*([-*]|\d+\.)\s+(.*)$/);
        if (m) { items.push(m[2]); i++; continue; }
        if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) { items[items.length - 1] += ' ' + lines[i].trim(); i++; continue; }
        break;
      }
      html.push(`<${tag}>` + items.map((t) => `<li>${inline(t)}</li>`).join('') + `</${tag}>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\s*\||\s*([-*]|\d+\.)\s)/.test(lines[i])) para.push(lines[i++].trim());
    html.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return html.join('\n');
}

const CSS = `
:root { --green: #2b8a3e; --ink: #1f2933; --line: #cfd8dc; --soft: #eef6f0; --bg: #ffffff; }
* { box-sizing: border-box; }
body { margin: 0; background: #f4f7f5; color: var(--ink); font: 16px/1.5 Verdana, "DejaVu Sans", sans-serif; }
.bar { position: sticky; top: 0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px 16px; background: var(--green); }
.bar a, .bar button { font: inherit; font-size: 14px; color: var(--green); background: #fff; border: 0; border-radius: 999px; padding: 6px 14px; text-decoration: none; cursor: pointer; }
.bar .primary { background: #ffd43b; color: #1f2933; font-weight: bold; }
.bar .spacer { flex: 1; }
main { max-width: 820px; margin: 16px auto; padding: 24px 28px; background: var(--bg); border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
h1 { color: var(--green); font-size: 26px; margin: 0 0 16px; }
h2 { color: var(--green); font-size: 19px; margin: 24px 0 8px; border-bottom: 2px solid var(--soft); padding-bottom: 4px; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; font-size: 14px; }
th, td { border: 1px solid var(--line); padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: var(--soft); }
table.meta td:first-child { width: 30%; background: var(--soft); }
code { background: var(--soft); padding: 1px 6px; border-radius: 4px; font-size: 14px; }
li { margin: 4px 0; }
a { color: var(--green); }
.cards { list-style: none; padding: 0; display: grid; gap: 12px; }
.cards a { display: block; padding: 14px 16px; border: 1px solid var(--line); border-radius: 10px; text-decoration: none; font-weight: bold; }
.cards a:hover { background: var(--soft); }
@media (max-width: 600px) { main { margin: 0; border-radius: 0; padding: 16px; } }
@page { size: A4; margin: 15mm; }
@media print {
  body { background: #fff; font-size: 11pt; }
  .bar { display: none; }
  main { max-width: none; margin: 0; padding: 0; box-shadow: none; }
  h2 { break-after: avoid; }
  table, li { break-inside: avoid; }
  a { color: inherit; text-decoration: none; }
}
`;

function page (lang, title, bar, body) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · EduTicTac Blocs Junior</title>
<link rel="icon" type="image/svg+xml" href="../../icon.svg">
<style>${CSS}</style>
</head>
<body>
<nav class="bar">${bar}</nav>
<main>
${body}
</main>
</body>
</html>
`;
}

let total = 0;
for (const lang of Object.keys(LANGS)) {
  const dir = join(src, lang);
  if (!existsSync(dir)) continue;
  const t = LANGS[lang];
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  mkdirSync(join(out, lang), { recursive: true });
  const cards = [];
  for (const f of files) {
    const { meta, body } = frontMatter(readFileSync(join(dir, f), 'utf8'));
    const title = (body.match(/^#\s+(.*)$/m) || [, f])[1];
    const name = f.replace(/\.md$/, '.html');
    const other = existsSync(join(src, OTHER[lang], f)) ? `../${OTHER[lang]}/${name}` : `../${OTHER[lang]}/index.html`;
    // mode storyStarter: com des de la galeria, no sobreescriu cap projecte de l'alumnat
    const open = meta.plantilla
      ? `<a class="primary" href="../../editor.html?pmd5=${encodeURIComponent(meta.plantilla).replace(/%2F/g, '/')}&amp;mode=storyStarter">${t.open}</a>`
      : '';
    const bar = `${open}<button type="button" onclick="window.print()">${t.print}</button>` +
      `<a href="index.html">${t.back}</a><span class="spacer"></span><a href="${other}" lang="${OTHER[lang]}">${t.other}</a>`;
    writeFileSync(join(out, lang, name), page(lang, title, bar, markdown(body)));
    cards.push(`<li><a href="${name}">${inline(title)}</a></li>`);
    total++;
  }
  const bar = `<a href="../../home.html?place=reptes">${t.app}</a><span class="spacer"></span><a href="../${OTHER[lang]}/index.html" lang="${OTHER[lang]}">${t.other}</a>`;
  writeFileSync(join(out, lang, 'index.html'),
    page(lang, t.index, bar, `<h1>${t.index}</h1>\n<p>${t.intro}</p>\n<ul class="cards">${cards.join('')}</ul>`));
}
console.log(`fitxes: ${total} generades a dist/fitxes/`);
