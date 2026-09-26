// Cicle de vida del projecte: crear, guardar (IndexedDB) i tornar a obrir.
import { test, expect } from '@playwright/test';
import { watch, openHome, waitEditor, addBlock, projectThumbs } from './helpers.mjs';

test('un projecte nou amb un bloc es guarda i persisteix en recarregar', async ({ page }) => {
  const w = await watch(page);
  await openHome(page);
  await expect(projectThumbs(page)).toHaveCount(0);

  await page.click('#newproject');
  await waitEditor(page);
  // el lobby no mostra els projectes nous sense cap canvi
  await addBlock(page);
  await page.dispatchEvent('#flip', 'mousedown');
  await page.waitForURL(/home\.html/);
  await expect(projectThumbs(page)).toHaveCount(1);

  // l'escriptura a IndexedDB es diferida; recarregar ha de conservar el projecte
  await page.waitForTimeout(1000);
  await page.reload();
  await expect(page.locator('#newproject')).toBeVisible();
  await expect(projectThumbs(page)).toHaveCount(1);

  await projectThumbs(page).first().click();
  await waitEditor(page);
  expect(w.errors).toEqual([]);
});

test('obrir un repte no crea cap projecte fins que es modifica', async ({ page }) => {
  await watch(page);
  await page.goto('editor.html?pmd5=samples/JuniorWalks.txt&mode=storyStarter');
  await waitEditor(page);
  await openHome(page);
  await expect(projectThumbs(page)).toHaveCount(0);
});
