// Fitxes docents: index, navegacio i obertura de la plantilla.
import { test, expect } from '@playwright/test';
import { watch, waitEditor } from './helpers.mjs';

for (const lang of ['ca', 'es']) {
  test(`les fitxes en ${lang} obrin la seua plantilla`, async ({ page }) => {
    const w = await watch(page, lang);
    await page.goto(`fitxes/${lang}/index.html`);
    const cards = page.locator('.cards a');
    await expect(cards).toHaveCount(6);
    await cards.first().click();
    await expect(page.locator('main h1')).toBeVisible();
    await page.locator('.bar a.primary').click();
    await waitEditor(page);
    expect(w.errors).toEqual([]);
    expect(w.external).toEqual([]);
  });
}
