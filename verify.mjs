import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const consoleErrors = [];
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'diagnostic-test-agent@example.com');
await page.fill('input[type="password"]', 'Test123456!');
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);

console.log('URL after login:', page.url());

const sidebarText = await page.locator('nav, aside, [role="navigation"]').first().textContent().catch(() => null);
console.log('Sidebar text:', sidebarText);

const bodyText = await page.textContent('body');
console.log('Contains "الحالات" (Cases):', bodyText?.includes('الحالات'));
console.log('Contains dashboard text:', bodyText?.includes('لوحة التحكم'));

await page.screenshot({ path: 'verify-after-login.png', fullPage: true });

console.log('Console/page errors so far:', JSON.stringify(consoleErrors, null, 2));

console.log('--- navigating directly to /cases ---');
await page.goto('http://localhost:5177/cases', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
console.log('URL after navigating to /cases:', page.url());
await page.screenshot({ path: 'verify-cases-page.png', fullPage: true });

console.log('All console/page errors:', JSON.stringify(consoleErrors, null, 2));

await browser.close();
