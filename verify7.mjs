import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const consoleMsgs = [];
page.on('console', (msg) => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));

await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
await page.locator('input[type="email"]').click();
await page.locator('input[type="email"]').type('diagnostic-test-agent@example.com', { delay: 10 });
await page.locator('input[type="password"]').click();
await page.locator('input[type="password"]').type('Test123456!', { delay: 10 });
await page.click('button[type="submit"]');

for (let i = 0; i < 12; i++) {
  await page.waitForTimeout(1000);
  const url = page.url();
  console.log(`t=${i + 1}s URL:`, url);
  if (url.includes('/dashboard')) break;
}

console.log('Final URL:', page.url());
await page.screenshot({ path: 'verify-after-fix.png', fullPage: true });

// Now try navigating to /cases as this role-less test user
await page.goto('http://localhost:5177/cases', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
console.log('URL after navigating to /cases:', page.url());
await page.screenshot({ path: 'verify-cases-after-fix.png', fullPage: true });

console.log('Console:', JSON.stringify(consoleMsgs.filter(m => m.includes('error') || m.includes('warn')), null, 2));
await browser.close();
