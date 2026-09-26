// Utilitats comunes de les proves E2E.
import { expect } from '@playwright/test';

// Fixa l'idioma i recull errors de pagina i peticions fora de l'origen.
export async function watch (page, lang = 'ca') {
  const errors = [];
  const external = [];
  await page.addInitScript((l) => {
    try { localStorage.setItem('localization', l); } catch (e) { /* sense emmagatzematge */ }
  }, lang);
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('request', (r) => {
    const url = r.url();
    if (!/^(data|blob):/.test(url) && !url.startsWith('http://127.0.0.1:')) external.push(url);
  });
  return { errors, external };
}

export async function openHome (page) {
  await page.goto('home.html');
  await expect(page.locator('#newproject')).toBeVisible();
  await expect(page.locator('#importproject')).toBeVisible();
}

export async function waitEditor (page) {
  await page.waitForURL(/editor\.html/);
  await expect(page.locator('#projectinfo')).toBeVisible();
  await expect(page.locator('#go')).toBeVisible();
  // deixa acabar la carrega asincrona de pagines i personatges
  await page.waitForTimeout(1500);
}

// Arrossega el primer bloc de la paleta a l'area de programes (marca el projecte com a canviat).
export async function addBlock (page) {
  const block = await page.locator('#palette > div').first().boundingBox();
  const area = await page.locator('.scripts').first().boundingBox();
  const x = block.x + block.width / 2;
  const y = block.y + block.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 20, y + 20, { steps: 5 });
  await page.mouse.move(area.x + area.width / 3, area.y + area.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(500);
}

// Projectes de l'usuari al lobby (sense les targetes «nou» i «importa»).
export const projectThumbs = (page) =>
  page.locator('#scrollarea .projectthumb:not(#newproject):not(#importproject)');

export function dbQuery (page, stmt) {
  return page.evaluate((s) => {
    const r = window.tablet.database_query(JSON.stringify({ stmt: s, values: [] }));
    return typeof r === 'string' ? JSON.parse(r) : r;
  }, stmt);
}
