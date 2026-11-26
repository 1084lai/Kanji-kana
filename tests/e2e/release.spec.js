// Prove per il rilascio: Crediti, uso senza rete, navigazione, frase d'esempio.
import {test, expect} from '@playwright/test';

async function apri(page, url = '/index.html') {
  await page.goto(url);
  await expect(page.locator('#loading')).toHaveCount(0, {timeout: 30000});
}

test('TC-CRE-01: scheda Crediti con fonti, autori e licenze', async ({page}) => {
  await apri(page);
  await page.locator('#tb-crediti').click();
  const t = page.locator('#tab-crediti');
  await expect(t).toBeVisible();
  for (const testo of ['KanjiVG', 'Ulrich Apel', 'CC BY-SA 3.0', 'KANJIDIC', 'JMdict', 'EDRDG', 'CC BY-SA 4.0', 'MIT'])
    await expect(t).toContainText(testo);
  await expect(t.locator('a[href*="kanjivg.tagaini.net"]')).toHaveCount(1);
  await expect(t.locator('a[href*="edrdg.org/edrdg/licence.html"]')).toHaveCount(1);
});

test('TC-NFR-07: il riferimento ai dati è sempre visibile e porta ai Crediti', async ({page}) => {
  await apri(page);
  for (const tab of ['disegna', 'kana', 'romaji', 'leggi', 'carte']) {
    await page.locator('#tb-' + tab).click();
    await expect(page.locator('#foot')).toBeVisible();
  }
  await page.locator('#foot-credits').click();
  await expect(page.locator('#tab-crediti')).toBeVisible();
});

test('TC-OFF-01: dopo il primo caricamento funziona senza rete', async ({page, context}) => {
  await apri(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#loading')).toHaveCount(0, {timeout: 30000});
  await expect(page.locator('#count')).toContainText(/6\.?395 kanji/);
  await page.locator('#tb-romaji').click();
  await page.locator('#rin').fill('konnichiwa');
  await expect(page.locator('#t-hira')).toHaveText('こんにちは');
});

test('TC-TRA-01: la scheda segue l\'indirizzo, anche con il tasto Indietro', async ({page}) => {
  await apri(page, '/index.html#carte');
  await expect(page.locator('#tab-carte')).toBeVisible();
  await page.evaluate(() => { location.hash = '#kana'; });
  await expect(page.locator('#tab-kana')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#tab-carte')).toBeVisible();
});

test('TC-LEG-07: la frase d\'esempio è originale e si analizza', async ({page}) => {
  await apri(page);
  await page.locator('#tb-leggi').click();
  await page.locator('#l-ex').click();
  const v = await page.locator('#lin').inputValue();
  expect(v).toBe('昨日、友達と駅の近くで美味しいラーメンを食べました。');
  await expect(page.locator('#lout')).toContainText('ラーメン');
  await page.locator('#l-clr').click();
  await expect(page.locator('#lin')).toHaveValue('');
});
