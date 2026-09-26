// Coherencia del contingut estatic: traduccions, plantilles, recursos i fitxes docents.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const app = join(root, 'src', 'app');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const media = readJson(join(app, 'media.json'));

test('les traduccions ca, es i en tenen les mateixes claus', () => {
  const keys = (l) => Object.keys(readJson(join(app, 'localizations', `${l}.json`))).sort();
  const ca = keys('ca');
  assert.deepEqual(keys('es'), ca);
  assert.deepEqual(keys('en'), ca);
});

test('les traduccions ca i es no tenen textos buits', () => {
  for (const l of ['ca', 'es']) {
    const loc = readJson(join(app, 'localizations', `${l}.json`));
    const empty = Object.keys(loc).filter((k) => typeof loc[k] === 'string' && !loc[k].trim());
    assert.deepEqual(empty, [], `claus buides en ${l}`);
  }
});

test('la configuracio activa els fitxers .sjr sense compartir per correu', () => {
  const settings = readJson(join(app, 'settings.json'));
  assert.equal(settings.sjrFilesEnabled, true);
  assert.equal(settings.shareEnabled, false);
});

const projects = [...media.challenges, ...media.samples];

test('cada repte i exemple existeix, es JSON valid i te miniatura', () => {
  for (const f of projects) {
    const file = join(app, f);
    assert.ok(existsSync(file), `falta ${f}`);
    const data = readJson(file);
    assert.ok(Array.isArray(data) && data.length > 0, `${f} buit`);
    assert.ok(existsSync(file.replace(/\.txt$/, '.png')), `falta la miniatura de ${f}`);
  }
});

test('els recursos que usen les plantilles existeixen', () => {
  const found = (r) => [join(app, r), join(app, 'svglibrary', r), join(app, 'samples', r), join(app, 'sounds', r)]
    .some(existsSync);
  const missing = [];
  for (const f of projects) {
    for (const project of readJson(join(app, f))) {
      const json = project.json;
      for (const pageId of json.pages) {
        const page = json[pageId];
        if (page.md5 && !found(page.md5)) missing.push(`${f}: fons ${page.md5}`);
        for (const id of page.sprites || page.layers || []) {
          const sprite = page[id];
          if (!sprite || sprite.type !== 'sprite') continue;
          if (!found(sprite.md5)) missing.push(`${f}: personatge ${sprite.md5}`);
          for (const s of sprite.sounds || []) if (!found(s)) missing.push(`${f}: so ${s}`);
        }
      }
    }
  }
  assert.deepEqual(missing, []);
});

test('les fitxes docents existeixen en ca i es i apunten a un repte', () => {
  const dir = join(root, 'docs', 'fitxes');
  const ca = readdirSync(join(dir, 'ca')).filter((f) => f.endsWith('.md')).sort();
  const es = readdirSync(join(dir, 'es')).filter((f) => f.endsWith('.md')).sort();
  assert.deepEqual(es, ca);
  assert.ok(ca.length >= 6);
  for (const lang of ['ca', 'es']) {
    for (const f of ca) {
      const text = readFileSync(join(dir, lang, f), 'utf8');
      const plantilla = (text.match(/^plantilla:\s*(.+)$/m) || [])[1];
      assert.ok(plantilla, `${lang}/${f} sense plantilla`);
      assert.ok(media.challenges.includes(plantilla.trim()), `${lang}/${f}: ${plantilla} no es a challenges`);
      assert.match(text, /^# .+/m, `${lang}/${f} sense titol`);
    }
  }
});
