import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
await page.locator('input[type="email"]').click();
await page.locator('input[type="email"]').type('diagnostic-test-agent@example.com', { delay: 10 });
await page.locator('input[type="password"]').click();
await page.locator('input[type="password"]').type('Test123456!', { delay: 10 });
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard', { timeout: 15000 });
console.log('Logged in, at:', page.url());

// in-app client-side navigation (no full reload) via direct URL change using goto but same origin+session
await page.goto('http://localhost:5177/cases', { waitUntil: 'networkidle' });
await page.waitForTimeout(9000); // allow the fresh 8s timeout window on this hard reload to elapse
console.log('URL after /cases + wait:', page.url());
await page.screenshot({ path: 'verify-cases-final.png', fullPage: true });
await browser.close();
