import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
page.on('console', (msg) => { errors.push(`[${msg.type()}] ${msg.text()}`); });

await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'diagnostic-test-agent@example.com');
await page.fill('input[type="password"]', 'Test123456!');
await page.click('button[type="submit"]');

for (let i = 0; i < 6; i++) {
  await page.waitForTimeout(1000);
  console.log(`t=${i+1}s URL:`, page.url());
}

const bodyText = await page.textContent('body');
console.log('Body snippet:', bodyText?.slice(0, 500));
await page.screenshot({ path: 'verify-login-attempt.png', fullPage: true });
console.log('All console messages:', JSON.stringify(errors, null, 2));

await browser.close();
