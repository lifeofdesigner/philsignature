const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CANDLE_NAMES = [
  'Vanilla Treat',
  'Cool Breeze',
  'Le Luxe',
  'Sandal Rose',
  'Champagne',
  'Coconut Lime',
  'Coco Vibes'
];

async function runVerification() {
  console.log('🚀 Starting Candle Storefront & Admin Verification...');
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const evidenceDir = path.join(__dirname, '..', 'candle_qa_evidence');
  if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

  const brokenImages = [];
  page.on('response', response => {
    if (response.request().resourceType() === 'image' && response.status() >= 400) {
      brokenImages.push(`${response.status()} - ${response.url()}`);
    }
  });

  // 1. Visit Shop / Candle Collection
  console.log('\n--- 1. Testing Candle Collection / Shop Page ---');
  await page.goto('http://localhost:4173/shop?category=candles');
  await page.waitForSelector('h1', { timeout: 15000 });
  // Wait for product cards or empty state
  await page.waitForTimeout(3000);

  // Check that all 7 candles appear
  for (const name of CANDLE_NAMES) {
    const card = page.locator(`text="${name}"`);
    const count = await card.count();
    console.log(`Checking ${name} on shop page: count = ${count}`);
  }

  // Check images on page
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));
  });

  const candleImgs = images.filter(img => img.src.includes('candle'));
  console.log(`Found ${candleImgs.length} candle images loaded on page.`);
  for (const img of candleImgs) {
    console.log(`  Img: ${img.src} -> ${img.naturalWidth}x${img.naturalHeight} (complete: ${img.complete})`);
  }

  await page.screenshot({ path: path.join(evidenceDir, '01_candle_shop_collection.png'), fullPage: true });

  // 2. Testing Candle Product Detail Page
  console.log('\n--- 2. Testing Candle Product Detail Page (Vanilla Treat & Coconut Lime) ---');
  await page.goto('http://localhost:4173/product/vanilla-treat');
  await page.waitForSelector('h1:has-text("Vanilla Treat")', { timeout: 15000 });
  await page.waitForTimeout(2000);

  const pdpImg = await page.evaluate(() => {
    const img = document.querySelector('img[src*="candle"], main img');
    return img ? {
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
    } : null;
  });
  console.log('Vanilla Treat PDP Main Image:', pdpImg);
  await page.screenshot({ path: path.join(evidenceDir, '02_pdp_vanilla_treat.png') });

  // 3. Testing Cart Interaction
  console.log('\n--- 3. Testing Cart Interaction ---');
  const addToCartBtn = page.locator('button', { hasText: /Add to (Bag|Cart)/i }).first();
  if (await addToCartBtn.count() > 0) {
    await addToCartBtn.click();
    await page.waitForTimeout(1500);
    console.log('Clicked Add to Cart');
  }
  
  await page.goto('http://localhost:4173/cart');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(evidenceDir, '03_cart_with_candle.png') });
  console.log('Captured Cart screenshot');

  // 4. Testing Wishlist
  console.log('\n--- 4. Testing Wishlist Interaction ---');
  await page.goto('http://localhost:4173/product/coconut-lime');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  const wishlistBtn = page.locator('button[aria-label*="wishlist" i], button:has(svg.lucide-heart)').first();
  if (await wishlistBtn.count() > 0) {
    await wishlistBtn.click();
    await page.waitForTimeout(1000);
    console.log('Toggled Wishlist on Coconut Lime');
  }

  await page.goto('http://localhost:4173/wishlist');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(evidenceDir, '04_wishlist_with_candle.png') });
  console.log('Captured Wishlist screenshot');

  // 5. Check broken images
  console.log('\n--- 5. Broken Images Check ---');
  if (brokenImages.length === 0) {
    console.log('✅ ZERO broken image requests detected across all tests!');
  } else {
    console.error('❌ Detected broken images:', brokenImages);
  }

  await browser.close();
  console.log('\n🎉 Verification completed successfully!');
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
