import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

await page.goto('http://localhost:5177/cases', { waitUntil: 'networkidle' });
await page.waitForTimeout(8000);
console.log('URL after 8s on /cases (fresh load, no session):', page.url());
await page.screenshot({ path: 'verify-cases-8s.png', fullPage: true });
console.log('Errors:', JSON.stringify(errors, null, 2));

await browser.close();
