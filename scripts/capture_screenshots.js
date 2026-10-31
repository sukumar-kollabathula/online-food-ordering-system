// capture_screenshots.js
// Playwright script to capture screenshots of the online food ordering app
// Viewport: 1440x1000
// Saves PNG files to docs/screenshots/

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Ensure screenshots directory exists
const screenshotsDir = path.resolve(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  // Helper to capture and log
  async function capture(name, url) {
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); // give UI time to settle
      const filepath = path.join(screenshotsDir, `${name}.png`);
      await page.screenshot({ path: filepath, fullPage: true });
      console.log(`Captured ${name}`);
    } catch (e) {
      console.error(`Failed to capture ${name}:`, e.message);
    }
  }

  const base = 'http://localhost:3000';

  // 1. Home page
  await capture('homepage', `${base}/`);

  // 2. Restaurants page
  await capture('restaurants', `${base}/restaurants`);

  // 3. Menu page – click first restaurant card if possible
  try {
    await page.goto(`${base}/restaurants`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Attempt to click first restaurant link/card
    const firstRestaurant = await page.$('a[href*="/menu"]');
    if (firstRestaurant) {
      await firstRestaurant.click();
      await page.waitForTimeout(2000);
      const menuPath = page.url();
      const menuName = 'menu';
      const menuFile = path.join(screenshotsDir, `${menuName}.png`);
      await page.screenshot({ path: menuFile, fullPage: true });
      console.log('Captured menu');
    } else {
      console.warn('No restaurant link found for menu capture');
    }
  } catch (e) {
    console.error('Menu capture error:', e.message);
  }

  // 4. Cart page – add first food item to cart from menu if possible
  try {
    // Assuming we are already on a menu page with "Add to Cart" buttons
    const addBtn = await page.$('button[data-testid="add-to-cart"]');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }
    await capture('cart', `${base}/cart`);
  } catch (e) {
    console.error('Cart capture error:', e.message);
  }

  // 5. Checkout page – fill form and place order, capture checkout before submit then after order
  try {
    await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await capture('checkout', `${base}/checkout`);

    // Fill form fields (assuming input names)
    await page.fill('input[name="customer_name"]', 'Test User');
    await page.fill('input[name="customer_contact"]', '1234567890');
    await page.fill('textarea[name="delivery_address"]', '123 Test St, City');
    // Submit order
    const placeBtn = await page.$('button[type="submit"]');
    if (placeBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        placeBtn.click()
      ]);
    }
    // Capture order confirmation page
    const orderConfPath = path.join(screenshotsDir, 'order_confirmation.png');
    await page.screenshot({ path: orderConfPath, fullPage: true });
    console.log('Captured order_confirmation');
  } catch (e) {
    console.error('Checkout/order confirmation error:', e.message);
  }

  // 6. Order History page
  try {
    await capture('order_history', `${base}/order-history`);
  } catch (e) {
    console.error('Order history capture error:', e.message);
  }

  // 7. Admin dashboard page
  try {
    await capture('admin_dashboard', `${base}/admin`);
  } catch (e) {
    console.error('Admin dashboard capture error:', e.message);
  }

  await browser.close();
})();
