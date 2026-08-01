import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (msg) => console.log(`[console:${msg.type()}]`, msg.text()));

await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
await page.waitForSelector('#\\:r0\\:', { timeout: 1000 }).catch(() => {});

const emailInput = page.locator('input[type="email"]');
await emailInput.waitFor({ state: 'visible' });
await emailInput.click();
await emailInput.type('diagnostic-test-agent@example.com', { delay: 20 });
const emailValue = await emailInput.inputValue();
console.log('Email field value after typing:', JSON.stringify(emailValue));

const passwordInput = page.locator('input[type="password"]');
await passwordInput.click();
await passwordInput.type('Test123456!', { delay: 20 });
const passValue = await passwordInput.inputValue();
console.log('Password field value after typing:', JSON.stringify(passValue));

await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
console.log('URL after submit:', page.url());
await page.screenshot({ path: 'verify-login2.png', fullPage: true });

await browser.close();
