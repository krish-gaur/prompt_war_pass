/* Prompt Wars Pass Generator — end-to-end smoke test */
const { chromium } = require('playwright');

const BASE = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Hero screenshot
  await page.screenshot({ path: '/home/user/shots/01-hero.png' });

  // 2. Fill the form
  await page.fill('#fullName', 'Aarav Sharma');
  await page.fill('#college', 'Delhi Technological University');
  await page.waitForTimeout(800);

  // 3. Upload photo
  await page.setInputFiles('input[type=file]', '/home/user/test-photo.jpg');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/home/user/shots/02-crop-modal.png' });

  // 4. Confirm crop
  await page.click('button:has-text("Use photo")');
  await page.waitForTimeout(900);

  // 5. Scroll to creator + screenshot live preview
  await page.locator('#creator').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/home/user/shots/03-creator-live-preview.png' });

  // Grab the live-preview canvas as PNG (verifies render output)
  const dataUrl = await page.evaluate(() => {
    const main = document.querySelector('#creator canvas');
    return main ? main.toDataURL('image/png') : null;
  });
  if (dataUrl) {
    const fs = require('fs');
    fs.writeFileSync('/home/user/shots/04-pass-render.png', Buffer.from(dataUrl.split(',')[1], 'base64'));
    console.log('PASS RENDER SAVED, size:', dataUrl.length);
  } else {
    console.log('NO 1024px CANVAS FOUND');
  }

  // 6. Generate
  await page.click('button:has-text("GENERATE MY PASS")');
  await page.waitForTimeout(1200);
  await page.locator('#your-pass').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/home/user/shots/05-result.png', fullPage: false });

  // 7. Test download
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.click('button:has-text("DOWNLOAD MY PASS")'),
  ]);
  const fname = download.suggestedFilename();
  await download.saveAs('/home/user/shots/06-downloaded.png');
  console.log('DOWNLOAD FILENAME:', fname);

  // 8. Long-name overflow test
  await page.click('button:has-text("Edit Details")');
  await page.waitForTimeout(400);
  await page.fill('#fullName', 'Sri Venkateshwara Prasanna Kumar');
  await page.fill('#college', 'Sri Venkateswara College of Engineering and Technology');
  await page.waitForTimeout(700);
  const dataUrl2 = await page.evaluate(() => {
    const main = document.querySelector('#creator canvas');
    return main ? main.toDataURL('image/png') : null;
  });
  if (dataUrl2) {
    const fs = require('fs');
    fs.writeFileSync('/home/user/shots/07-long-names.png', Buffer.from(dataUrl2.split(',')[1], 'base64'));
    console.log('LONG NAME RENDER SAVED');
  }

  // 9. Mobile viewport check
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  console.log('MOBILE H-SCROLL:', hasHScroll);
  await page.screenshot({ path: '/home/user/shots/08-mobile-hero.png' });

  console.log('CONSOLE ERRORS:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch((e) => {
  console.error('TEST FAILED:', e.message);
  process.exit(1);
});
