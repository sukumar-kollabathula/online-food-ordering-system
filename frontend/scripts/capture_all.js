// capture_all.js (fixed)
// Playwright script to capture all required screenshots with correct selectors.
// Viewport: 1440x1000
// Saves PNG files to docs/screenshots/ (overwrites existing files).

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Resolve screenshots directory (project root/docs/screenshots)
const screenshotsDir = path.resolve(__dirname, '..', '..', 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  const base = 'http://localhost:3000';

  // Helper to capture a screenshot and log it
  async function capture(name, url) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // allow UI to settle
    const filePath = path.join(screenshotsDir, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Captured ${name}`);
  }

  // 1. Home page
  await capture('homepage', `${base}/`);

  // 2. Restaurants page
  await capture('restaurants', `${base}/restaurants`);

  // 3. Menu page – click the first restaurant card’s View Menu button.
  try {
    await page.goto(`${base}/restaurants`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
        // Find the first "View Menu" button by its text and click it
    const viewMenuBtn = await page.$('button:has-text("View Menu")');
    if (viewMenuBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        viewMenuBtn.click()
      ]);
      // Wait for Add to Cart button on the menu page
      await page.waitForSelector('button[data-testid=\"add-to-cart\"]', { timeout: 10000 });
      const menuPath = path.join(screenshotsDir, 'menu.png');
      await page.screenshot({ path: menuPath, fullPage: true });
      console.log('Captured menu');
    } else {
      console.warn('No View Menu button found – cannot capture menu');
    }
    // duplicate block removed
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        firstMenuBtn.click()
      ]);
      // Wait for a selector that only appears on the menu page – the Add to Cart button
      await page.waitForSelector('button[data-testid="add-to-cart"]', { timeout: 8000 });
      const menuPath = path.join(screenshotsDir, 'menu.png');
      await page.screenshot({ path: menuPath, fullPage: true });
      console.log('Captured menu');
    } else {
      console.warn('No View Menu button found – cannot capture menu');
    }
  } catch (e) {
    console.error('Menu capture error:', e.message);
  }

  // 4. Cart page – add first dish to cart then capture
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

  // 5. Checkout page – fill form using positional selectors (no placeholders)
  try {
    await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await capture('checkout', `${base}/checkout`);

    // Fill the three fields: first input = name, second input = contact, textarea = address
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill('Test User');
      await inputs[1].fill('0123456789');
    }
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('123 Test St, City');
    }

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        submitBtn.click()
      ]);
    }
    // Capture order confirmation page
    await page.screenshot({ path: path.join(screenshotsDir, 'order_confirmation.png'), fullPage: true });
    console.log('Captured order_confirmation');
  } catch (e) {
    console.error('Checkout / order confirmation error:', e.message);
  }

  // 6. Order history page
  await capture('order_history', `${base}/order-history`);

  // 7. Admin dashboard page
  await capture('admin_dashboard', `${base}/admin`);

  await browser.close();
})();
