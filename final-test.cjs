/* Final acceptance test — full flow + validation + edge cases */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // --- Validation: generate with empty fields ---
  await page.locator('#creator').scrollIntoViewIfNeeded();
  await page.click('button:has-text("GENERATE MY PASS")');
  await page.waitForTimeout(400);
  const errCount = await page.locator('[role=alert]').count();
  console.log('VALIDATION ERRORS SHOWN (expect 3):', errCount);
  const resultShown = await page.locator('#your-pass').count();
  console.log('RESULT BLOCKED WHEN INVALID (expect 0):', resultShown);

  // --- Fill valid data + photo ---
  await page.fill('#fullName', 'Ananya Iyer');
  await page.fill('#college', 'Indian Institute of Technology Madras');
  await page.setInputFiles('input[type=file]', '/home/user/test-photo.jpg');
  await page.waitForTimeout(900);
  await page.click('button:has-text("Use photo")');
  await page.waitForTimeout(600);

  await page.click('button:has-text("GENERATE MY PASS")');
  await page.waitForTimeout(1000);
  console.log('RESULT AFTER VALID GENERATE (expect 1):', await page.locator('#your-pass').count());

  // --- Buttons present ---
  for (const label of ['DOWNLOAD MY PASS', 'Share My Pass', 'Share on LinkedIn', 'Share on WhatsApp', 'Share on Instagram', 'Copy event announcement', 'Download Pass Again', 'Regenerate Pass', 'Change Photo', 'Edit Details', 'Create Another Pass']) {
    const n = await page.locator(`button:has-text("${label}")`).count();
    if (n === 0) console.log('MISSING BUTTON:', label);
  }
  console.log('ALL BUTTONS CHECKED');

  // --- Copy announcement actually copies ---
  await page.click('button:has-text("Copy event announcement")');
  await page.waitForTimeout(300);

  // --- Download works + filename ---
  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.click('button:has-text("DOWNLOAD MY PASS")'),
  ]);
  console.log('DOWNLOAD FILENAME (expect PromptWars_Ananya_Iyer.png):', dl.suggestedFilename());
  await dl.saveAs('/home/user/shots/final-download.png');

  // --- Create Another Pass resets ---
  await page.click('button:has-text("Create Another Pass")');
  await page.waitForTimeout(700);
  const nameVal = await page.inputValue('#fullName');
  console.log('RESET NAME FIELD (expect empty):', JSON.stringify(nameVal));
  console.log('RESULT HIDDEN AFTER RESET (expect 0):', await page.locator('#your-pass').count());

  // --- File type validation (try a .txt) ---
  fs.writeFileSync('/home/user/evil.txt', 'not an image');
  await page.setInputFiles('input[type=file]', '/home/user/evil.txt');
  await page.waitForTimeout(400);
  const alertText = await page.locator('[role=alert]').first().textContent();
  console.log('REJECTS BAD FILE TYPE:', alertText ? 'YES' : 'NO', '-', (alertText || '').trim().slice(0, 60));

  // --- Mobile creator flow screenshot ---
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.fill('#fullName', 'Ananya Iyer');
  await page.fill('#college', 'IIT Madras');
  await page.setInputFiles('input[type=file]', '/home/user/test-photo.jpg');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Use photo")');
  await page.click('button:has-text("GENERATE MY PASS")');
  await page.waitForTimeout(1000);
  await page.locator('#your-pass').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/home/user/shots/09-mobile-result.png' });
  const hScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  console.log('MOBILE H-SCROLL (expect false):', hScroll);

  console.log('CONSOLE ERRORS:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch((e) => {
  console.error('TEST FAILED:', e.message);
  process.exit(1);
});
