// Ogni test del browser fallisce se la pagina scrive errori in console (comprese le violazioni della CSP)
// o contatta altri siti.
import {test as base, expect} from '@playwright/test';

export const test = base.extend({
  page: async ({page}, use) => {
    const problemi = [];
    page.on('pageerror', e => problemi.push('errore: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') problemi.push('console: ' + m.text()); });
    page.on('request', r => { if (new URL(r.url()).origin !== 'http://localhost:8000') problemi.push('rete: ' + r.url()); });
    await use(page);
    expect(problemi).toEqual([]);
  }
});
export {expect};
