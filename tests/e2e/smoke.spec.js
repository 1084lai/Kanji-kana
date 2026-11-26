// Prove nel browser. Riferimenti al test book indicati nei titoli.
import {test, expect} from '@playwright/test';

async function apri(page) {
  const errori = [], esterne = [];
  page.on('pageerror', e => errori.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
  page.on('request', r => { const u = new URL(r.url()); if (u.origin !== 'http://localhost:8000') esterne.push(r.url()); });
  await page.goto('/index.html');
  await expect(page.locator('#loading')).toHaveCount(0, {timeout: 30000});
  return {errori, esterne};
}

async function tratto(page, box, punti) {
  const p = ([x, y]) => [box.x + x * box.width, box.y + y * box.height];
  await page.mouse.move(...p(punti[0]));
  await page.mouse.down();
  for (const q of punti.slice(1)) await page.mouse.move(...p(q), {steps: 6});
  await page.mouse.up();
}

test('TC-DIS-01/02/10: si carica, si disegna 日 e si riconosce', async ({page}) => {
  const {errori} = await apri(page);
  await expect(page.locator('#count')).toContainText(/6\.?395 kanji/);
  const box = await page.locator('#pad').boundingBox();
  await tratto(page, box, [[0.30, 0.20], [0.30, 0.80]]);
  await tratto(page, box, [[0.30, 0.20], [0.70, 0.20], [0.70, 0.80]]);
  await tratto(page, box, [[0.30, 0.50], [0.70, 0.50]]);
  await tratto(page, box, [[0.30, 0.80], [0.70, 0.80]]);
  await expect(page.locator('#cands button').first()).toBeVisible();
  const prime = await page.locator('#cands button .g').allTextContents();
  expect(prime.slice(0, 3)).toContain('日');
  await expect(page.locator('#detail')).toBeVisible();
  expect(errori).toEqual([]);
});

test('TC-DIS-05/06: annulla tratto e cancella', async ({page}) => {
  await apri(page);
  await expect(page.locator('#undo')).toBeDisabled();
  await expect(page.locator('#clear')).toBeDisabled();
  const box = await page.locator('#pad').boundingBox();
  await tratto(page, box, [[0.30, 0.50], [0.70, 0.50]]);
  await expect(page.locator('#undo')).toBeEnabled();
  await page.locator('#undo').click();
  await expect(page.locator('#undo')).toBeDisabled();
});

test('TC-ROM-01, TC-KAN-03: «konnichiwa» e こんにちは', async ({page}) => {
  await apri(page);
  await page.locator('#tb-romaji').click();
  await page.locator('#rin').fill('konnichiwa');
  await expect(page.locator('#t-hira')).toHaveText('こんにちは');
  await expect(page.locator('#t-kata')).toHaveText('コンニチハ');
  await page.locator('#m-k2r').click();
  await page.locator('#rin').fill('こんにちは');
  await expect(page.locator('#t-roma')).toHaveText('konnichiwa');
  await page.locator('#tb-kana').click();
  for (const k of ['こ', 'ん', 'に', 'ち', 'は'])
    await page.locator('#kgrid .kc', {has: page.locator('.kk', {hasText: new RegExp('^' + k + '$')})}).first().click();
  await expect(page.locator('#kroma')).toHaveText('konnichiwa');
});

test('TC-ROM-04: frase in scrittura mista', async ({page}) => {
  await apri(page);
  await page.locator('#tb-romaji').click();
  await page.locator('#rin').fill('watashi wa gakkou de benkyou shimasu');
  await expect(page.locator('#t-kanji')).toContainText('私');
  await expect(page.locator('#t-kanji')).toContainText('学校');
  await expect(page.locator('#t-kanji')).toContainText('勉強');
});

test('TC-LEG-01/03: lettore', async ({page}) => {
  await apri(page);
  await page.locator('#tb-leggi').click();
  await page.locator('#lin').fill('私は学校で食べました。');
  await expect(page.locator('#lout')).toBeVisible();
  await expect(page.locator('#lout')).toContainText('べました');
  await expect(page.locator('#lout ruby').first()).toBeVisible();
});

test('TC-CAR-01/02/08: studio di una carta e persistenza', async ({page}) => {
  await apri(page);
  await page.locator('#tb-carte').click();
  await page.locator('#fc-decks .dk', {hasText: 'Hiragana'}).getByRole('button', {name: 'Studia'}).click();
  await page.getByRole('button', {name: 'Mostra risposta'}).click();
  await page.locator('.ab.good').click();
  const salvato = await page.evaluate(() => JSON.parse(localStorage.getItem('fc_v1')));
  expect(Object.keys(salvato.cards).length).toBe(1);
  await page.reload();
  await expect(page.locator('#loading')).toHaveCount(0, {timeout: 30000});
  const dopo = await page.evaluate(() => JSON.parse(localStorage.getItem('fc_v1')));
  expect(Object.keys(dopo.cards).length).toBe(1);
});

test('TC-TRA-02, TC-NFR-01: nessuna richiesta verso altri siti', async ({page}) => {
  const {esterne} = await apri(page);
  for (const t of ['kana', 'romaji', 'leggi', 'carte']) await page.locator('#tb-' + t).click();
  expect(esterne).toEqual([]);
});
