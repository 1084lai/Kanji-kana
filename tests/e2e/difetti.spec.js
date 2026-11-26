// Prove nel browser dei difetti corretti (DEF-04, 05, 06, 07, 09, 11, 12).
import {test, expect} from './fixtures.js';
import {test as senzaControlli} from '@playwright/test';

async function apri(page, url = '/index.html') {
  await page.goto(url);
  await expect(page.locator('#loading')).toHaveCount(0, {timeout: 30000});
}

async function tratto(page, punti) {
  const box = await page.locator('#pad').boundingBox();
  const p = ([x, y]) => [box.x + x * box.width, box.y + y * box.height];
  await page.mouse.move(...p(punti[0]));
  await page.mouse.down();
  for (const q of punti.slice(1)) await page.mouse.move(...p(q), {steps: 6});
  await page.mouse.up();
}

async function apriImpostazioni(page) {
  const d = page.locator('details', {has: page.locator('#fc-bk')});
  if (!(await d.evaluate(e => e.open))) await d.locator('summary').click();
}

const salvato = page => page.evaluate(() => JSON.parse(localStorage.getItem('fc_v1')));

async function studiaUnaCarta(page, mazzo) {
  await page.locator('#tb-carte').click();
  await page.locator('#fc-decks .dk', {hasText: mazzo}).getByRole('button', {name: 'Studia'}).click();
  await page.getByRole('button', {name: 'Mostra risposta'}).click();
  await page.locator('.ab.good').click();
}

test('DEF-04: un salvataggio illeggibile è segnalato e conservato, non perso in silenzio', async ({page}) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('gia')) { sessionStorage.setItem('gia', '1'); localStorage.setItem('fc_v1', '{"cards": 5'); } });
  await apri(page);
  await page.locator('#tb-carte').click();
  await expect(page.locator('#fc-corrupt')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('fc_v1_illeggibile'))).toBe('{"cards": 5');
});

test('DEF-04: ripristino con testo non valido o di versione futura non tocca i progressi', async ({page}) => {
  await apri(page);
  await studiaUnaCarta(page, 'Hiragana');
  const prima = await salvato(page);
  await page.locator('#fc-back').click();
  await apriImpostazioni(page);
  for (const [testo, messaggio] of [['questo non è un backup', 'Testo non valido'],
      [await page.evaluate(() => btoa(JSON.stringify({v: 99, cards: {}}))), 'più recente'],
      [await page.evaluate(() => btoa('{"cards": 5}')), 'Testo non valido']]) {
    await page.locator('#fc-bk').fill(testo);
    await page.locator('#fc-bkr').click();
    await expect(page.locator('#fc-bkr')).toContainText(messaggio);
    expect(await salvato(page)).toEqual(prima);
    await page.waitForTimeout(1700);
  }
});

test('TC-CAR-09: esporta, azzera e ripristina il backup', async ({page}) => {
  await apri(page);
  await studiaUnaCarta(page, 'Hiragana');
  await page.locator('#fc-back').click();
  await apriImpostazioni(page);
  const prima = Object.keys((await salvato(page)).cards);
  await page.locator('#fc-bkc').click();
  const testo = await page.locator('#fc-bk').inputValue();
  expect(testo.length).toBeGreaterThan(20);
  await page.locator('#fc-rst').click();
  await expect(page.locator('#fc-rst')).toContainText('Sicuro');
  await page.locator('#fc-rst').click();
  expect(Object.keys((await salvato(page)).cards)).toEqual([]);
  await page.locator('#fc-bk').fill(testo);
  await page.locator('#fc-bkr').click();
  await expect(page.locator('#fc-bkr')).toContainText('Ripristinato');
  expect(Object.keys((await salvato(page)).cards)).toEqual(prima);
});

test('DEF-05: da Disegna una carta già presente è segnalata', async ({page}) => {
  await apri(page);
  await tratto(page, [[0.30, 0.20], [0.30, 0.80]]);
  await tratto(page, [[0.30, 0.20], [0.70, 0.20], [0.70, 0.80]]);
  await tratto(page, [[0.30, 0.50], [0.70, 0.50]]);
  await tratto(page, [[0.30, 0.80], [0.70, 0.80]]);
  await expect(page.locator('#detail')).toBeVisible();
  await page.locator('#fcadd').click();
  await expect(page.locator('#fcadd')).toContainText('Aggiunta');
  await page.waitForTimeout(1500);
  await page.locator('#fcadd').click();
  await expect(page.locator('#fcadd')).toContainText('Già nelle carte');
  expect((await salvato(page)).cust).toHaveLength(1);
});

test('DEF-06: una carta manuale uguale non si duplica', async ({page}) => {
  await apri(page);
  await page.locator('#tb-carte').click();
  await apriImpostazioni(page);
  for (const atteso of ['Aggiunta', 'Già nelle carte']) {
    await page.locator('#fc-f').fill('約束');
    await page.locator('#fc-b').fill('promessa');
    await page.locator('#fc-addm').click();
    await expect(page.locator('#fc-addm')).toContainText(atteso);
    await page.waitForTimeout(1300);
  }
  expect((await salvato(page)).cust).toHaveLength(1);
});

test('DEF-07: cambiando mazzo l\'annullamento non resta attivo', async ({page}) => {
  await apri(page);
  await studiaUnaCarta(page, 'Hiragana');
  await expect(page.locator('#fc-undo')).toBeEnabled();
  await page.locator('#fc-back').click();
  await page.locator('#fc-decks .dk', {hasText: 'Katakana'}).getByRole('button', {name: 'Studia'}).click();
  await expect(page.locator('#fc-undo')).toBeDisabled();
  await expect(page.locator('#fc-card')).not.toContainText('Hai finito');
});

test('DEF-09: un secondo dito (palmo) non interrompe il tratto', async ({page}) => {
  await apri(page);
  const esito = await page.evaluate(() => {
    const pad = document.getElementById('pad'), r = pad.getBoundingClientRect();
    const ev = (tipo, id, fx, fy) => pad.dispatchEvent(new PointerEvent(tipo, {pointerId: id, pointerType: 'touch', bubbles: true, cancelable: true,
      clientX: r.left + fx * r.width, clientY: r.top + fy * r.height}));
    ev('pointerdown', 1, 0.3, 0.5); ev('pointermove', 1, 0.4, 0.5);
    ev('pointerdown', 2, 0.8, 0.8); ev('pointermove', 2, 0.9, 0.9); ev('pointerup', 2, 0.9, 0.9);   // tocco in più: ignorato
    ev('pointermove', 1, 0.7, 0.5); ev('pointerup', 1, 0.7, 0.5);
    return true;
  });
  expect(esito).toBe(true);
  await expect(page.locator('#status')).toContainText('1 tratto');
});

test('DEF-09: ridimensionando la finestra il tratto segue la tela', async ({page}) => {
  await page.setViewportSize({width: 900, height: 900});
  await apri(page);
  await tratto(page, [[0.2, 0.2], [0.8, 0.3]]);
  await page.setViewportSize({width: 420, height: 900});
  await page.waitForTimeout(300);
  const colore = await page.evaluate(() => {
    const c = document.getElementById('pad'), ctx = c.getContext('2d');
    return Array.from(ctx.getImageData(Math.round(0.5 * c.width), Math.round(0.25 * c.height), 1, 1).data);
  });
  expect(colore[3]).toBeGreaterThan(200);   // il pixel è inchiostro (non trasparente)
});

test('DEF-12: se non si può salvare, le parole note lo segnalano', async ({page}) => {
  await page.addInitScript(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'kn_known_v1') throw new Error('pieno'); return o.call(this, k, v); }; });
  await apri(page);
  await page.locator('#tb-leggi').click();
  await page.locator('#lin').fill('学校');
  await page.locator('#lout .w').first().click();
  await page.getByRole('button', {name: 'La conosco già'}).click();
  await expect(page.locator('#l-warn')).toBeVisible();
});

senzaControlli('DEF-11: la pagina ha una Content-Security-Policy che blocca gli script in linea', async ({page}) => {
  await page.goto('/index.html');
  await expect(page.locator('#loading')).toHaveCount(0, {timeout: 30000});
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("script-src 'self'");
  expect(csp).not.toMatch(/unsafe-(inline|eval)/);
  expect(csp).toContain("object-src 'none'");
  const bloccato = await page.evaluate(() => new Promise(risolvi => {
    document.addEventListener('securitypolicyviolation', e => risolvi(e.violatedDirective), {once: true});
    const s = document.createElement('script'); s.textContent = 'window.__iniettato = 1'; document.head.appendChild(s);
    setTimeout(() => risolvi('nessuna violazione'), 1500);
  }));
  expect(bloccato).toContain('script-src');
  expect(await page.evaluate(() => window.__iniettato)).toBeUndefined();
});
