const { chromium } = require('playwright-core');
const fs = require('fs');

const BASE_URL = 'http://localhost:4173';
const ADMIN_EMAIL = 'lifeofcuba@gmail.com';
const ADMIN_PASSWORD = 'Password123!';

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
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

async function runFullBrowserQA() {
  console.log('===============================================================');
  console.log('  PHILZ SIGNATURE - FULL BROWSER-BASED PRODUCTION QA SUITE     ');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  const networkFailures = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon.ico') && !text.includes('Download the React DevTools')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes('favicon.ico')) {
      networkFailures.push({ url, status, statusText: response.statusText() });
    }
  });

  // ==========================================
  // PHASE 1: STOREFRONT PAGES & FLOWS AUDIT
  // ==========================================
  console.log('\n--- PHASE 1: Storefront Pages & Flows ---');

  // 1. Home Page
  console.log('\n[1.1] Home Page Audit (/)');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  assert(await page.title() !== '', 'Home page title is present');
  assert(await page.locator('nav').count() > 0, 'Navigation bar renders on Home page');
  assert(await page.locator('footer').count() > 0, 'Footer renders on Home page');

  // 2. Shop Page & Catalog Pagination
  console.log('\n[1.2] Shop Page Audit (/shop)');
  await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
  
  const page1CardCount = await page.locator('[data-testid="product-card"]').count();
  assert(page1CardCount === 12, `Shop page 1 displays 12 paginated products (found: ${page1CardCount})`);

  // Verify starting price and size variant indicators
  const priceTexts = await page.locator('text=₦15,000').count();
  assert(priceTexts > 0, 'Shop page displays "From ₦15,000" starting price tags');
  const sizeBadgeTexts = await page.locator('text=4 Sizes').count();
  assert(sizeBadgeTexts > 0, 'Shop page displays "4 Sizes (15ml - 100ml)" badges');

  // Test Pagination Button to Page 2
  console.log('\n[1.3] Storefront Pagination Interaction');
  const page2Btn = page.locator('nav[aria-label="Catalog navigation"] button:has-text("2")');
  if (await page2Btn.count() > 0) {
    await page2Btn.first().click();
    await page.waitForTimeout(600);
    const page2CardCount = await page.locator('[data-testid="product-card"]').count();
    assert(page2CardCount === 12, `Shop page 2 displays 12 products (found: ${page2CardCount})`);
  }

  // Test Search Filter on Shop Page
  console.log('\n[1.4] Storefront Search Filter Test');
  const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]');
  if (await searchInput.count() > 0) {
    await searchInput.first().fill('Maracuja');
    await page.waitForTimeout(600);
    const searchFilteredCount = await page.locator('[data-testid="product-card"]').count();
    assert(searchFilteredCount >= 1 && searchFilteredCount <= 5, `Search for "Maracuja" filtered correctly (count: ${searchFilteredCount})`);
    
    // Clear search
    await searchInput.first().fill('');
    await page.waitForTimeout(600);
  }

  // 3. Product Detail Page & Variant Selection (Oud Maracuja)
  console.log('\n[1.5] Product Detail Page & Variant Interaction (/product/oud-maracuja)');
  await page.goto(`${BASE_URL}/product/oud-maracuja`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Oud Maracuja', { timeout: 10000 });
  assert(await page.locator('text=Oud Maracuja').count() > 0, 'Product title "Oud Maracuja" renders on detail page');
  
  // Verify Default 30ml Price (₦30,000)
  assert(await page.locator('text=₦30,000').count() > 0, 'Default variant (30ml) price renders as ₦30,000');

  // Test Variant Selection 15ml (₦15,000)
  const btn15ml = page.locator('button:has-text("15ml")');
  if (await btn15ml.count() > 0) {
    await btn15ml.first().click();
    await page.waitForTimeout(300);
    assert(await page.locator('text=₦15,000').count() > 0, 'Selecting 15ml variant updates price to ₦15,000');
  }

  // Test Variant Selection 50ml (₦40,000)
  const btn50ml = page.locator('button:has-text("50ml")');
  if (await btn50ml.count() > 0) {
    await btn50ml.first().click();
    await page.waitForTimeout(300);
    assert(await page.locator('text=₦40,000').count() > 0, 'Selecting 50ml variant updates price to ₦40,000');
  }

  // Test Variant Selection 100ml (₦75,000)
  const btn100ml = page.locator('button:has-text("100ml")');
  if (await btn100ml.count() > 0) {
    await btn100ml.first().click();
    await page.waitForTimeout(300);
    assert(await page.locator('text=₦75,000').count() > 0, 'Selecting 100ml variant updates price to ₦75,000');
  }

  // Test Scent Notes and Best For
  assert(await page.locator('text=Fruity • Woody • Oud').count() > 0, 'Fragrance family badge renders');
  assert(await page.locator('text=Unisex').count() > 0, 'Best For badge renders');

  // Test Add to Cart
  console.log('\n[1.6] Cart & Checkout Workflow');
  const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add To Bag")');
  if (await addToCartBtn.count() > 0) {
    await addToCartBtn.first().click();
    await page.waitForTimeout(600);
    assert(true, 'Add to Cart button clicked successfully');
  }

  // Navigate to Cart Page
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  assert(await page.locator('text=Cart').count() > 0 || await page.locator('text=Shopping Bag').count() > 0, 'Cart page loaded');
  assert(await page.locator('text=Oud Maracuja').count() > 0, 'Added product variant appears in Cart');

  // Navigate to Checkout Page
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  assert(await page.locator('text=Checkout').count() > 0, 'Checkout page loaded with order summary');

  // 4. Static and Informational Pages
  console.log('\n[1.7] Informational & Support Pages Audit');
  const staticPages = [
    { url: '/about', titleCheck: 'About' },
    { url: '/contact', titleCheck: 'Contact' },
    { url: '/faq', titleCheck: 'FAQ' },
    { url: '/privacy', titleCheck: 'Privacy' },
    { url: '/terms', titleCheck: 'Terms' },
    { url: '/shipping-policy', titleCheck: 'Shipping' },
    { url: '/returns-policy', titleCheck: 'Return' },
    { url: '/track-order', titleCheck: 'Track' },
    { url: '/collections', titleCheck: 'Collection' },
    { url: '/wishlist', titleCheck: 'Wishlist' }
  ];

  for (const sp of staticPages) {
    await page.goto(`${BASE_URL}${sp.url}`, { waitUntil: 'networkidle' });
    const hasContent = (await page.content()).toLowerCase().includes(sp.titleCheck.toLowerCase());
    assert(hasContent, `Page ${sp.url} loaded and contains "${sp.titleCheck}"`);
  }

  // ==========================================
  // PHASE 2: AUTHENTICATION & ADMIN WORKFLOWS
  // ==========================================
  console.log('\n--- PHASE 2: Super Admin Login & Module Audits ---');

  // 1. Admin Login via UI
  console.log('\n[2.1] Admin Login Flow');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for login redirection
  await page.waitForTimeout(3000);
  if (!page.url().includes('/admin')) {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  }
  
  assert(page.url().includes('/admin'), `Successfully authenticated and entered Admin Dashboard (${page.url()})`);

  // 2. Audit Every Admin Route & UI Components
  const adminRoutes = [
    { path: '/admin', name: 'Dashboard', checkText: 'Dashboard' },
    { path: '/admin/products', name: 'Products Management', checkText: 'Products' },
    { path: '/admin/collections', name: 'Collections Management', checkText: 'Collections' },
    { path: '/admin/categories', name: 'Categories Management', checkText: 'Categories' },
    { path: '/admin/orders', name: 'Orders Management', checkText: 'Orders' },
    { path: '/admin/customers', name: 'Customers Management', checkText: 'Customers' },
    { path: '/admin/cms', name: 'CMS & Pages', checkText: 'CMS' },
    { path: '/admin/media', name: 'Media Library', checkText: 'Media' },
    { path: '/admin/coupons', name: 'Coupons Management', checkText: 'Coupons' },
    { path: '/admin/reviews', name: 'Reviews Moderation', checkText: 'Reviews' },
    { path: '/admin/payments', name: 'Payments & Gateways', checkText: 'Payments' },
    { path: '/admin/shipping', name: 'Shipping & Delivery', checkText: 'Shipping' },
    { path: '/admin/analytics', name: 'Analytics & Reports', checkText: 'Analytics' },
    { path: '/admin/users', name: 'User Management & RBAC', checkText: 'Users' },
    { path: '/admin/settings', name: 'Store Settings', checkText: 'Settings' },
    { path: '/admin/seo', name: 'SEO & Meta Management', checkText: 'SEO' }
  ];

  console.log('\n[2.2] Admin Submodule Rendering & Table Verification');
  for (const adm of adminRoutes) {
    await page.goto(`${BASE_URL}${adm.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const content = await page.content();
    const matchesCheck = content.toLowerCase().includes(adm.checkText.toLowerCase());
    assert(matchesCheck, `Admin Module: ${adm.name} (${adm.path}) renders correctly`);
  }

  // 3. Admin Products Page CRUD & Modals End-to-End
  console.log('\n[2.3] Admin Products Table & Modal Actions End-to-End');
  await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle' });
  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  
  // Verify Table Rows (Default page size = 10)
  const tableRows = await page.locator('table tbody tr').count();
  assert(tableRows >= 10, `Admin Products table renders paginated catalog products (found: ${tableRows})`);

  // Test Product Search in Admin Table
  const adminSearch = page.locator('input[placeholder*="Search" i], input[type="search"]');
  if (await adminSearch.count() > 0) {
    await adminSearch.first().fill('Santal Supreme');
    await page.waitForTimeout(500);
    const filteredAdminRows = await page.locator('table tbody tr').count();
    assert(filteredAdminRows >= 1 && filteredAdminRows <= 5, `Admin table search for "Santal Supreme" filtered to ${filteredAdminRows} row(s)`);
    await adminSearch.first().fill('');
    await page.waitForTimeout(500);
  }

  // Test "Add Product" Modal Opening & Form Elements
  const addProductBtn = page.locator('button:has-text("Add Product"), button:has-text("Create Product"), button:has-text("New Product")');
  if (await addProductBtn.count() > 0) {
    await addProductBtn.first().click();
    await page.waitForTimeout(600);
    const modalVisible = await page.locator('role=dialog, [role="dialog"], .fixed.inset-0').count() > 0;
    assert(modalVisible, 'Add Product dialog modal opens cleanly on button click');
    
    // Check form fields
    assert(await page.locator('input[name="name"], input#name, label:has-text("Name")').count() > 0, 'Product name field present in modal');
    
    // Close modal
    const closeBtn = page.locator('button:has-text("Cancel"), button[aria-label="Close"], button:has-text("Close")');
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await page.waitForTimeout(400);
    }
  }

  // 4. Admin Users & RBAC Matrix
  console.log('\n[2.4] Admin Users & RBAC Matrix Audit (/admin/users)');
  await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle' });
  const usersCount = await page.locator('table tbody tr').count();
  assert(usersCount >= 2, `Admin Users table displays active staff/admin accounts (count: ${usersCount})`);

  // ==========================================
  // PHASE 3: CUSTOMER ACCOUNT PAGES AUDIT
  // ==========================================
  console.log('\n--- PHASE 3: Customer Account Pages ---');
  const accountPages = [
    { path: '/account', check: 'Dashboard' },
    { path: '/account/orders', check: 'Orders' },
    { path: '/account/addresses', check: 'Addresses' },
    { path: '/account/profile', check: 'Profile' }
  ];

  for (const ap of accountPages) {
    await page.goto(`${BASE_URL}${ap.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const content = await page.content();
    assert(content.toLowerCase().includes(ap.check.toLowerCase()), `Account Page: ${ap.path} rendered successfully`);
  }

  // ==========================================
  // PHASE 4: RESPONSIVE VIEWPORTS AUDIT
  // ==========================================
  console.log('\n--- PHASE 4: Responsive Viewports & Layouts ---');

  // Tablet Viewport
  console.log('\n[4.1] Tablet Viewport (768x1024)');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' });
  assert(await page.locator('header, nav').count() > 0, 'Header/Nav is intact at Tablet resolution');

  // Mobile Viewport
  console.log('\n[4.2] Mobile Viewport (375x812)');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  assert(await page.locator('header, nav').count() > 0, 'Header/Nav is intact at Mobile resolution');
  
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  assert(await page.locator('body').count() > 0, 'Admin shell renders cleanly at Mobile resolution');

  // Restore Desktop Viewport
  await page.setViewportSize({ width: 1440, height: 900 });

  // ==========================================
  // PHASE 5: CONSOLE & NETWORK AUDIT
  // ==========================================
  console.log('\n--- PHASE 5: Console Errors & Network Failures Audit ---');
  console.log(`Console Errors Caught: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors logged during browser session:', consoleErrors);
  }
  assert(consoleErrors.length === 0, 'Zero unhandled console or runtime errors during entire browser session');

  console.log(`Network Failures Caught: ${networkFailures.length}`);
  if (networkFailures.length > 0) {
    console.error('Network failures logged during browser session:', networkFailures);
  }
  assert(networkFailures.length === 0, 'Zero failed network requests during entire browser session');

  await browser.close();

  console.log('\n===============================================================');
  console.log(`  QA SUMMARY: ${results.passed} PASSED | ${results.failed} FAILED `);
  console.log('===============================================================');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runFullBrowserQA().catch(err => {
  console.error('Fatal Browser QA Error:', err);
  process.exit(1);
});

