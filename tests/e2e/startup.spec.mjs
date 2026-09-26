// Inici de l'aplicacio i privacitat (cap peticio fora de l'origen).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { watch, openHome, waitEditor } from './helpers.mjs';

const media = JSON.parse(readFileSync(new URL('../../src/app/media.json', import.meta.url), 'utf8'));

test('la portada carrega sense errors', async ({ page }) => {
  const w = await watch(page);
  await page.goto('index.html');
  await expect(page).toHaveTitle(/Blocs Junior/);
  expect(w.errors).toEqual([]);
  expect(w.external).toEqual([]);
});

test('el lobby carrega amb la marca EduTicTac i sense peticions externes', async ({ page }) => {
  const w = await watch(page);
  await openHome(page);
  await expect(page).toHaveTitle('EduTicTac Blocs Junior');
  expect(await page.evaluate(() => typeof window.tablet.database_query)).toBe('function');
  await expect(page.locator('body')).not.toContainText('ScratchJr');
  expect(w.errors).toEqual([]);
  expect(w.external).toEqual([]);
});

for (const lang of ['ca', 'es', 'en']) {
  test(`la targeta d'importar es tradueix (${lang})`, async ({ page }) => {
    await watch(page, lang);
    await openHome(page);
    const loc = JSON.parse(readFileSync(new URL(`../../src/app/localizations/${lang}.json`, import.meta.url), 'utf8'));
    await expect(page.locator('#importproject h4')).toHaveText(loc.SJR_IMPORT);
  });
}

for (const tpl of media.challenges) {
  test(`el repte ${tpl} s'obri a l'editor sense errors`, async ({ page }) => {
    const w = await watch(page);
    await page.goto(`editor.html?pmd5=${tpl}&mode=storyStarter`);
    await waitEditor(page);
    expect(w.errors).toEqual([]);
    expect(w.external).toEqual([]);
  });
}

test('el botó Reptes de la portada obri la pestanya Reptes', async ({ page }) => {
  const w = await watch(page);
  await page.goto('index.html?back=yes');
  await expect(page.locator('#startreptes')).toBeVisible();
  await page.dispatchEvent('#startreptes', 'mousedown');
  await page.waitForURL(/place=reptes/);
  await expect(page.locator('.cards, #wrapc').first()).toBeVisible();
  await expect(page.locator('#reptestab')).toHaveClass(/on/);
  expect(w.errors).toEqual([]);
});
