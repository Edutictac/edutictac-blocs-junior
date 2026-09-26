// Generacio de les fitxes docents (scripts/build-fitxes.mjs) en una carpeta temporal.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let out;

before(() => {
  out = mkdtempSync(join(tmpdir(), 'fitxes-'));
  execFileSync(process.execPath, [join(root, 'scripts', 'build-fitxes.mjs')], {
    env: { ...process.env, FITXES_OUT: out },
    stdio: 'pipe',
  });
});

after(() => rmSync(out, { recursive: true, force: true }));

test('genera una pagina per fitxa i un index per idioma', () => {
  for (const lang of ['ca', 'es']) {
    const md = readdirSync(join(root, 'docs', 'fitxes', lang)).filter((f) => f.endsWith('.md'));
    const html = readdirSync(join(out, lang)).filter((f) => f.endsWith('.html')).sort();
    assert.deepEqual(html, [...md.map((f) => f.replace(/\.md$/, '.html')), 'index.html'].sort());
  }
});

test('les fitxes obrin la plantilla en mode storyStarter', () => {
  const html = readFileSync(join(out, 'ca', '01-junior-camina.html'), 'utf8');
  assert.match(html, /href="\.\.\/\.\.\/editor\.html\?pmd5=samples\/JuniorWalks\.txt&amp;mode=storyStarter"/);
  assert.match(html, /<html lang="ca">/);
  assert.match(html, /href="\.\.\/es\/01-junior-camina\.html"/);
});

test('converteix el markdown de les fitxes', () => {
  const html = readFileSync(join(out, 'es', '01-junior-camina.html'), 'utf8');
  assert.match(html, /<h1>Ficha docente 1 — Junior camina<\/h1>/);
  assert.match(html, /<table class="meta">/);
  assert.match(html, /<thead><tr><th>Bloque<\/th>/);
  assert.match(html, /<ol><li><strong>Inicio \(5 min\)\.<\/strong>/);
  assert.match(html, /<code>bandera verde<\/code>/);
  assert.match(html, /<a href="https:\/\/blocs-junior\.edutictac\.es">/);
  // cap resta de sintaxi markdown sense convertir
  assert.doesNotMatch(html.replace(/<style>[\s\S]*<\/style>/, ''), /\*\*|^#+ /m);
});

test("l'index enllaca totes les fitxes i torna a la pestanya Reptes", () => {
  const html = readFileSync(join(out, 'ca', 'index.html'), 'utf8');
  const links = html.match(/<li><a href="[^"]+\.html">/g) || [];
  assert.equal(links.length, readdirSync(join(root, 'docs', 'fitxes', 'ca')).filter((f) => f.endsWith('.md')).length);
  assert.match(html, /home\.html\?place=reptes/);
});
