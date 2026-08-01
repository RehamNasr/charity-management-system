import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('requestfailed', (req) => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));
page.on('response', (res) => {
  if (res.url().includes('identitytoolkit') || res.url().includes('securetoken')) {
    console.log('RESPONSE', res.status(), res.url());
  }
});
page.on('console', (msg) => console.log(`[console:${msg.type()}]`, msg.text()));
page.on('pageerror', (err) => console.log('PAGEERROR', err.message));

await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
await page.locator('input[type="email"]').click();
await page.locator('input[type="email"]').type('diagnostic-test-agent@example.com', { delay: 10 });
await page.locator('input[type="password"]').click();
await page.locator('input[type="password"]').type('Test123456!', { delay: 10 });
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
console.log('Final URL:', page.url());

await browser.close();
