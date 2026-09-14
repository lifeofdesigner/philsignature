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

async function testCandleCollections() {
  console.log('🚀 Starting Candle Collections & Storefront Verification...');
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

  // 1. Visit /collections
  console.log('\n--- 1. Testing /collections Page ---');
  await page.goto('http://localhost:4173/collections');
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(2500);

  const candleCardLink = page.locator('a[href*="collection="]:has-text("Scented Candle Collection")').first();
  const hasCandleCard = await candleCardLink.count();
  console.log(`Checking Scented Candle Collection Card on /collections: count = ${hasCandleCard}`);
  if (hasCandleCard === 0) {
    throw new Error('Scented Candle Collection card not found on /collections!');
  }

  const href = await candleCardLink.getAttribute('href');
  console.log(`Candle Collection link href: ${href}`);

  await page.screenshot({ path: path.join(evidenceDir, 'collections_page_with_candles.png'), fullPage: true });

  // 2. Click Scented Candle Collection card
  console.log('\n--- 2. Clicking Scented Candle Collection ---');
  await candleCardLink.click();
  await page.waitForTimeout(3000);

  console.log(`Current URL: ${page.url()}`);
  const shopHeading = await page.locator('h1').first().textContent();
  console.log(`Shop Page Heading: "${shopHeading?.trim()}"`);

  // Verify all 7 candles appear
  let foundInCollection = 0;
  for (const name of CANDLE_NAMES) {
    const card = page.locator(`text="${name}"`);
    const count = await card.count();
    if (count > 0) foundInCollection++;
    console.log(`  - ${name}: count = ${count}`);
  }
  console.log(`Total candles displayed under Scented Candle Collection: ${foundInCollection}/7`);
  if (foundInCollection < 7) {
    throw new Error(`Expected all 7 candles, but only found ${foundInCollection}`);
  }

  await page.screenshot({ path: path.join(evidenceDir, 'shop_by_candle_collection.png'), fullPage: true });

  // 3. Visit /shop?category=candles directly
  console.log('\n--- 3. Testing /shop?category=candles ---');
  await page.goto('http://localhost:4173/shop?category=candles');
  await page.waitForTimeout(2500);

  let foundInCategory = 0;
  for (const name of CANDLE_NAMES) {
    const card = page.locator(`text="${name}"`);
    const count = await card.count();
    if (count > 0) foundInCategory++;
    console.log(`  - ${name}: count = ${count}`);
  }
  console.log(`Total candles displayed under Category Candles: ${foundInCategory}/7`);
  if (foundInCategory < 7) {
    throw new Error(`Expected all 7 candles under category, but found ${foundInCategory}`);
  }

  await page.screenshot({ path: path.join(evidenceDir, 'shop_by_candle_category.png'), fullPage: true });

  // 4. Visit Homepage / and check Collections showcase
  console.log('\n--- 4. Testing Homepage Collections Showcase ---');
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(2500);

  const homeCandleCard = page.locator('a[href*="collection="]:has-text("Scented Candle Collection")');
  const homeHasCandle = await homeCandleCard.count();
  console.log(`Checking Scented Candle Collection on Homepage: count = ${homeHasCandle}`);

  await page.screenshot({ path: path.join(evidenceDir, 'homepage_with_candle_collection.png') });

  // 5. Broken images check
  console.log('\n--- 5. Broken Images Check ---');
  if (brokenImages.length === 0) {
    console.log('✅ ZERO broken image requests detected!');
  } else {
    console.error('❌ Detected broken images:', brokenImages);
  }

  await browser.close();
  console.log('\n🎉 All tests passed successfully!');
}

testCandleCollections().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
