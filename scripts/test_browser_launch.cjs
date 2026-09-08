const { chromium } = require('playwright-core');

async function test() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome' // or 'msedge'
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:4173/');
  const title = await page.title();
  console.log('Successfully launched browser! Page title:', title);
  
  await browser.close();
}

test().catch(err => {
  console.error('Launch error:', err);
  process.exit(1);
});

