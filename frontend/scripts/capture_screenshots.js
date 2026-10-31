// capture_screenshots.js (frontend version)
// Playwright script to capture screenshots of the online food ordering app
// Viewport: 1440x1000
// Saves PNG files to docs/screenshots/

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.resolve(__dirname, '..', '..', 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  async function capture(name, url) {
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const filepath = path.join(screenshotsDir, `${name}.png`);
      await page.screenshot({ path: filepath, fullPage: true });
      console.log(`Captured ${name}`);
    } catch (e) {
      console.error(`Failed to capture ${name}:`, e.message);
    }
  }

  const base = 'http://localhost:3000';

  await capture('homepage', `${base}/`);
  await capture('restaurants', `${base}/restaurants`);

  // Menu page
  try {
    await page.goto(`${base}/restaurants`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const firstLink = await page.$('a[href*="/menu"]');
    if (firstLink) {
      await firstLink.click();
      await page.waitForTimeout(2000);
      const menuPath = path.join(screenshotsDir, 'menu.png');
      await page.screenshot({ path: menuPath, fullPage: true });
      console.log('Captured menu');
    }
  } catch (e) {
    console.error('Menu capture error:', e.message);
  }

  // Cart page
  try {
    const addBtn = await page.$('button[data-testid="add-to-cart"]');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }
    await capture('cart', `${base}/cart`);
  } catch (e) {
    console.error('Cart capture error:', e.message);
  }

  // Checkout and order confirmation
  try {
    await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await capture('checkout', `${base}/checkout`);
    await page.fill('input[name="customer_name"]', 'Test User');
    await page.fill('input[name="customer_contact"]', '1234567890');
    await page.fill('textarea[name="delivery_address"]', '123 Test St');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        submitBtn.click()
      ]);
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'order_confirmation.png'), fullPage: true });
    console.log('Captured order_confirmation');
  } catch (e) {
    console.error('Checkout error:', e.message);
  }

  await capture('order_history', `${base}/order-history`);
  await capture('admin_dashboard', `${base}/admin`);

  await browser.close();
})();
