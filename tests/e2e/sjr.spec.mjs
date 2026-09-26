// Exportacio i importacio de projectes .sjr (prova d'anada i tornada).
import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import JSZip from 'jszip';
import { watch, openHome, waitEditor, projectThumbs, dbQuery } from './helpers.mjs';

const FIXTURE = new URL('../fixtures/custom-character.sjr', import.meta.url).pathname;
const CHARACTER = '684d2fe4d5619c650e4360eaae236987.svg';

async function importSjr (page, file) {
  const chooser = page.waitForEvent('filechooser');
  await page.click('#importproject');
  await (await chooser).setFiles(file);
}

async function exportSjr (page) {
  await page.click('#projectinfo');
  await expect(page.locator('#infoboxShareButtonSave')).toBeVisible();
  const download = page.waitForEvent('download');
  await page.dispatchEvent('#infoboxShareButtonSave', 'mousedown');
  const d = await download;
  const zip = await JSZip.loadAsync(readFileSync(await d.path()));
  return { name: d.suggestedFilename(), zip };
}

test('importar un .sjr amb personatge propi i tornar-lo a exportar', async ({ page }) => {
  const w = await watch(page);
  await openHome(page);
  await importSjr(page, FIXTURE);
  await expect(projectThumbs(page)).toHaveCount(1);
  await expect(projectThumbs(page).first().locator('h4')).toHaveText('Prova personatge');

  const shapes = await dbQuery(page, 'select md5, name from usershapes');
  expect(JSON.stringify(shapes)).toContain(CHARACTER);

  await projectThumbs(page).first().click();
  await waitEditor(page);
  const { name, zip } = await exportSjr(page);
  expect(name).toBe('Prova personatge.sjr');
  const files = Object.keys(zip.files);
  expect(files).toContain('project/data.json');
  expect(files).toContain(`project/characters/${CHARACTER}`);
  const data = JSON.parse(await zip.file('project/data.json').async('string'));
  expect(data.name).toBe('Prova personatge');
  expect(data.json.pages.length).toBeGreaterThan(0);
  expect(w.errors).toEqual([]);
});

test('exportar un repte i importar-lo en un navegador net', async ({ page, browser }, testInfo) => {
  await watch(page, 'ca');
  await page.goto('editor.html?pmd5=samples/JuniorMaze.txt&mode=storyStarter');
  await waitEditor(page);
  const { name, zip } = await exportSjr(page);
  expect(name).toMatch(/\.sjr$/);
  expect(Object.keys(zip.files)).toContain('project/data.json');
  const data = JSON.parse(await zip.file('project/data.json').async('string'));
  expect(name).toBe(`${data.name}.sjr`);

  const file = testInfo.outputPath(name);
  writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer' }));

  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  const clean = await ctx.newPage();
  const w = await watch(clean, 'ca');
  await openHome(clean);
  await importSjr(clean, file);
  await expect(projectThumbs(clean)).toHaveCount(1);
  await expect(projectThumbs(clean).first().locator('h4')).toHaveText(data.name);
  await projectThumbs(clean).first().click();
  await waitEditor(clean);
  expect(w.errors).toEqual([]);
  await ctx.close();
});

test('importar el mateix fitxer dues vegades dona noms diferents', async ({ page }) => {
  await watch(page);
  await openHome(page);
  await importSjr(page, FIXTURE);
  await expect(projectThumbs(page)).toHaveCount(1);
  await importSjr(page, FIXTURE);
  await expect(projectThumbs(page)).toHaveCount(2);
  const names = await projectThumbs(page).locator('h4').allTextContents();
  expect(new Set(names).size).toBe(2);
});

for (const [label, buffer] of [
  ['un fitxer que no es un zip', Buffer.from('hola')],
  ['un zip sense data.json', null],
]) {
  test(`importar ${label} mostra un avis i no crea cap projecte`, async ({ page }) => {
    await watch(page, 'ca');
    await openHome(page);
    let buf = buffer;
    if (!buf) {
      const zip = new JSZip();
      zip.file('project/readme.txt', 'res');
      buf = await zip.generateAsync({ type: 'nodebuffer' });
    }
    const loc = JSON.parse(readFileSync(new URL('../../src/app/localizations/ca.json', import.meta.url), 'utf8'));
    const dialog = page.waitForEvent('dialog');
    const chooser = page.waitForEvent('filechooser');
    await page.click('#importproject');
    await (await chooser).setFiles({ name: 'dolent.sjr', mimeType: 'application/zip', buffer: buf });
    const d = await dialog;
    expect(d.message()).toBe(loc.SJR_IMPORT_ERROR);
    await d.dismiss();
    await expect(projectThumbs(page)).toHaveCount(0);
  });
}
