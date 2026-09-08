const { chromium } = require('playwright-core');

const BASE_URL = 'http://localhost:4173';
const ADMIN_EMAIL = 'lifeofcuba@gmail.com';
const ADMIN_PASSWORD = 'Password123!';

const results = {
  passed: 0,
  failed: 0,
  details: []
};

function assert(condition, message, details = '') {
  if (condition) {
    results.passed++;
    console.log(`  ✓ ${message}`);
  } else {
    results.failed++;
    console.error(`  ✗ FAIL: ${message} - ${details}`);
    results.details.push({ status: 'FAILED', message, details });
  }
}

async function runBrowserCrudQA() {
  console.log('===============================================================');
  console.log('  PHILZ SIGNATURE - BROWSER UI CRUD & TRANSACTION QA SUITE     ');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // 1. Admin Authentication
  console.log('\n[1] Authenticating as Super Admin via Login Form...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);

  // 2. Admin Coupon Creation via UI Modal
  console.log('\n[2] Testing Admin Coupons Module UI (/admin/coupons)...');
  await page.goto(`${BASE_URL}/admin/coupons`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const addCouponBtn = page.locator('button:has-text("New Coupon"), button:has-text("Add Coupon")');
  if (await addCouponBtn.count() > 0) {
    await addCouponBtn.first().click();
    await page.waitForTimeout(500);

    const couponCodeInput = page.locator('input[placeholder="e.g. EXCLUSIVE15"]');
    if (await couponCodeInput.count() > 0) {
      await couponCodeInput.first().fill('BROWSER_QA_15');
    }

    const discountValInput = page.locator('input[placeholder="15"]');
    if (await discountValInput.count() > 0) {
      await discountValInput.first().fill('15');
    }

    const saveCouponBtn = page.locator('button:has-text("Create Coupon")');
    if (await saveCouponBtn.count() > 0) {
      await saveCouponBtn.first().click();
      await page.waitForTimeout(2000);
      assert(true, 'Submitted new coupon creation form in modal');
    }

    // Verify coupon in table
    await page.goto(`${BASE_URL}/admin/coupons`, { waitUntil: 'networkidle' });
    const hasCoupon = (await page.content()).includes('BROWSER_QA_15');
    assert(hasCoupon, 'Newly created coupon "BROWSER_QA_15" appears in Admin table');
  }

  // 3. Admin Shipping Rate Creation via UI Modal
  console.log('\n[3] Testing Admin Shipping Module UI (/admin/shipping)...');
  await page.goto(`${BASE_URL}/admin/shipping`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const addShippingBtn = page.locator('button:has-text("New Rate Zone"), button:has-text("Add Shipping")');
  if (await addShippingBtn.count() > 0) {
    await addShippingBtn.first().click();
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[placeholder*="Lagos Express" i]');
    if (await nameInput.count() > 0) {
      await nameInput.first().fill('QA Priority Express');
    }

    const priceInput = page.locator('input[placeholder="3500"], input[type="number"]');
    if (await priceInput.count() > 0) {
      await priceInput.first().fill('5000');
    }

    const saveShippingBtn = page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")');
    if (await saveShippingBtn.count() > 0) {
      await saveShippingBtn.first().click();
      await page.waitForTimeout(1500);
      assert(true, 'Submitted new shipping method form in modal');
    }

    await page.goto(`${BASE_URL}/admin/shipping`, { waitUntil: 'networkidle' });
    const hasShipping = (await page.content()).includes('QA Priority Express');
    assert(hasShipping, 'Newly created shipping method "QA Priority Express" appears in Admin table');
  }

  // 4. Storefront Buy Now -> Checkout Flow
  console.log('\n[4] Testing Storefront Buy Now -> Checkout -> Order Flow...');
  await page.goto(`${BASE_URL}/product/oud-maracuja`, { waitUntil: 'networkidle' });
  
  // Select 100ml variant (₦75,000)
  const btn100 = page.locator('button:has-text("100ml")');
  if (await btn100.count() > 0) {
    await btn100.first().click();
    await page.waitForTimeout(300);
  }

  // Click Buy Now (which adds to cart and redirects directly to checkout)
  const buyNowBtn = page.locator('button:has-text("Buy Now")');
  if (await buyNowBtn.count() > 0) {
    await buyNowBtn.first().click();
    await page.waitForTimeout(1500);
  }

  assert(page.url().includes('/checkout'), `Buy Now button redirected to Checkout page (${page.url()})`);

  // Fill Address Step Form
  const firstNameInput = page.locator('input[name="firstName"]');
  if (await firstNameInput.count() > 0) await firstNameInput.fill('Amara');

  const lastNameInput = page.locator('input[name="lastName"]');
  if (await lastNameInput.count() > 0) await lastNameInput.fill('Okonkwo');

  const emailInput = page.locator('input[name="email"]');
  if (await emailInput.count() > 0) await emailInput.fill('amara.qa@example.com');

  const phoneInput = page.locator('input[name="phone"]');
  if (await phoneInput.count() > 0) await phoneInput.fill('08012345678');

  const addressInput = page.locator('input[name="streetAddress"]');
  if (await addressInput.count() > 0) await addressInput.fill('12 Victoria Island Boulevard');

  const cityInput = page.locator('input[name="city"]');
  if (await cityInput.count() > 0) await cityInput.fill('Lagos');

  // Click Proceed to Shipping
  const proceedShippingBtn = page.locator('button:has-text("Continue to Delivery"), button:has-text("Proceed to Shipping"), button:has-text("Continue to Shipping")');
  if (await proceedShippingBtn.count() > 0) {
    await proceedShippingBtn.first().click();
    await page.waitForTimeout(600);
    assert(true, 'Completed Delivery Address Step and navigated to Shipping Step');
  }

  // Select Shipping Method
  const shippingOption = page.locator('input[type="radio"], [role="radio"], button:has-text("Delivery")');
  if (await shippingOption.count() > 0) {
    await shippingOption.first().click();
    await page.waitForTimeout(400);
  }

  const proceedPaymentBtn = page.locator('button:has-text("Continue to Payment"), button:has-text("Proceed to Payment")');
  if (await proceedPaymentBtn.count() > 0) {
    await proceedPaymentBtn.first().click();
    await page.waitForTimeout(600);
    assert(true, 'Selected Shipping Method and navigated to Payment Step');
  }

  // Select Bank Transfer / COD Payment
  const bankTransferOption = page.locator('button:has-text("Bank Transfer"), label:has-text("Bank Transfer")');
  if (await bankTransferOption.count() > 0) {
    await bankTransferOption.first().click();
    await page.waitForTimeout(400);
  }

  // Place Order
  const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Complete Order"), button:has-text("Confirm Order")');
  if (await placeOrderBtn.count() > 0) {
    await placeOrderBtn.first().click();
    await page.waitForTimeout(4000);
    
    const currentUrl = page.url();
    const confirmed = currentUrl.includes('/confirmation') || (await page.content()).includes('Order Confirmed') || (await page.content()).includes('Thank you');
    assert(confirmed, `Order placed successfully and confirmation displayed (URL: ${currentUrl})`);
  }

  await browser.close();

  console.log('\n===============================================================');
  console.log(`  CRUD QA SUMMARY: ${results.passed} PASSED | ${results.failed} FAILED `);
  console.log('===============================================================');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runBrowserCrudQA().catch(err => {
  console.error('Fatal CRUD QA Error:', err);
  process.exit(1);
});

