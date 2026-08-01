import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'diagnostic-test-agent@example.com');
await page.fill('input[type="password"]', 'Test123456!');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
console.log('URL after login (4s):', page.url());

// Now click into the sidebar to see what's actually rendered
const sidebarButtons = await page.locator('.MuiDrawer-root .MuiListItemButton-root, .MuiDrawer-root a').allTextContents();
console.log('Sidebar nav item labels visible:', JSON.stringify(sidebarButtons));

await page.goto('http://localhost:5177/cases', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
console.log('URL after navigating to /cases (in-session):', page.url());
await page.screenshot({ path: 'verify-cases-insession.png', fullPage: true });
console.log('Errors:', JSON.stringify(errors, null, 2));

await browser.close();
