/* Prompt Wars pass generator — desktop + mobile acceptance test. */
const { chromium } = require('playwright-core');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const BASE = 'http://localhost:5173';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = 'C:\\Users\\GALAXY ENTERPRISES\\Downloads\\workspace-01a217eb-41f9-713d-88a9-d912168e7f9b';
const SHOTS = path.join(ROOT, 'shots');
const PHOTO1 = path.join(ROOT, 'test-photo.jpg');
const PHOTO2 = path.join(ROOT, 'test-photo-2.jpg');

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

async function waitForCanvas(page, selector = '#creator canvas') {
  await page.waitForFunction((sel) => {
    const c = document.querySelector(sel);
    if (!c) return false;
    const d = c.getContext('2d').getImageData(0, 0, 1, 1).data;
    return d[3] !== 0;
  }, selector, { timeout: 15000 });
}

async function fillAndUpload(page, { name, college, photo }) {
  await page.fill('#fullName', name);
  await page.fill('#college', college);
  await page.setInputFiles('input[type=file]', photo);
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === 'Use photo');
    return b && !b.disabled;
  }, null, { timeout: 15000 });
  await page.getByRole('button', { name: 'Use photo' }).click();
  await page.waitForFunction(() => document.body.innerText.includes('Photo ready'), null, { timeout: 15000 });
  await page.waitForTimeout(700);
}

async function canvasPng(page, selector) {
  const dataUrl = await page.evaluate((sel) => document.querySelector(sel).toDataURL('image/png'), selector);
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function canvasAnalysis(page, selector) {
  return page.evaluate(async (args) => {
    const { sel } = args;
    const target = document.querySelector(sel);
    const ctx = target.getContext('2d');
    const data = ctx.getImageData(0, 0, 1024, 1536).data;
    const lum = (x, y) => {
      const i = (y * 1024 + x) * 4;
      return (data[i] + data[i + 1] + data[i + 2]) / 3;
    };
    const bbox = (x0, y0, x1, y1, thr) => {
      let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1, count = 0;
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++)
          if (lum(x, y) > thr) {
            count++;
            if (x < minx) minx = x;
            if (x > maxx) maxx = x;
            if (y < miny) miny = y;
            if (y > maxy) maxy = y;
          }
      return count ? { minx, miny, maxx, maxy, w: maxx - minx + 1, h: maxy - miny + 1, count } : null;
    };

    // Compare against the exact master artwork the app renders on top of.
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = '/assets/pass-template-clean.png';
    });
    const t = document.createElement('canvas');
    t.width = 1024;
    t.height = 1536;
    const tc = t.getContext('2d');
    tc.drawImage(img, 0, 0);
    const td = tc.getImageData(0, 0, 1024, 1536).data;
    const inEditable = (x, y) =>
      (x >= 350 && x <= 676 && y >= 616 && y <= 982) || // photo frame
      (x >= 70 && x <= 955 && y >= 975 && y <= 1095) || // name band
      (x >= 70 && x <= 955 && y >= 1108 && y <= 1182); // college band
    let outsideCount = 0, outsideMax = 0;
    for (let y = 0; y < 1536; y++)
      for (let x = 0; x < 1024; x++) {
        if (inEditable(x, y)) continue;
        const i = (y * 1024 + x) * 4;
        const d = Math.abs(data[i] - td[i]) + Math.abs(data[i + 1] - td[i + 1]) + Math.abs(data[i + 2] - td[i + 2]);
        if (d > 0) {
          outsideCount++;
          if (d > outsideMax) outsideMax = d;
        }
      }

    // Photo region variance (checkerboard would be very light and uniform).
    let sum = 0, sum2 = 0, n = 0;
    for (let y = 640; y < 960; y += 3)
      for (let x = 375; x < 650; x += 3) {
        const i = (y * 1024 + x) * 4;
        const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
        sum += v;
        sum2 += v * v;
        n++;
      }
    const mean = sum / n;
    return {
      name: bbox(70, 985, 955, 1085, 150),
      college: bbox(70, 1114, 955, 1182, 150),
      outside: { count: outsideCount, max: outsideMax },
      photo: { mean: Math.round(mean), std: Math.round(Math.sqrt(sum2 / n - mean * mean)) },
    };
  }, { sel: selector });
}
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const errors = [];
  const results = {};

  // ---------------- DESKTOP ----------------
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await waitForCanvas(page, '#creator canvas');

  // Validation
  await page.locator('#creator').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'GENERATE MY PASS' }).click();
  await page.waitForTimeout(300);
  results.validationAlerts = await page.locator('[role=alert]').count();
  results.resultBlocked = await page.locator('#your-pass').count();

  // TEST 1: Aarav Sharma / IIT Delhi
  await fillAndUpload(page, { name: 'Aarav Sharma', college: 'IIT Delhi', photo: PHOTO1 });
  results.previewAarav = await canvasAnalysis(page, '#creator canvas');
  fs.writeFileSync(path.join(SHOTS, 'test-preview-aarav.png'), await canvasPng(page, '#creator canvas'));
  await page.getByRole('button', { name: 'GENERATE MY PASS' }).click();
  await page.waitForSelector('#your-pass');
  await page.waitForTimeout(700);
  results.resultAarav = await canvasAnalysis(page, '#your-pass canvas');
  fs.writeFileSync(path.join(SHOTS, 'test-result-aarav.png'), await canvasPng(page, '#your-pass canvas'));

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.getByRole('button', { name: 'DOWNLOAD MY PASS' }).click(),
  ]);
  results.downloadName = download.suggestedFilename();
  const dlPath = path.join(SHOTS, 'test-download-aarav.png');
  await download.saveAs(dlPath);
  const dlBuf = fs.readFileSync(dlPath);
  const previewBuf = fs.readFileSync(path.join(SHOTS, 'test-preview-aarav.png'));
  const resultBuf = fs.readFileSync(path.join(SHOTS, 'test-result-aarav.png'));
  results.previewDownloadIdentical = sha(previewBuf) === sha(dlBuf);
  results.resultDownloadIdentical = sha(resultBuf) === sha(dlBuf);
  results.downloadSize = dlBuf.length;

  // TEST 2: long name + long college
  await page.getByRole('button', { name: 'Edit Details' }).click();
  await page.waitForTimeout(300);
  await page.fill('#fullName', 'Sri Venkateshwara Prasanna Kumar');
  await page.fill('#college', 'Sri Venkateswara College of Engineering and Technology');
  await page.waitForTimeout(800);
  results.long = await canvasAnalysis(page, '#your-pass canvas');
  fs.writeFileSync(path.join(SHOTS, 'test-long-names.png'), await canvasPng(page, '#your-pass canvas'));

  // TEST 3: different photograph
  await page.setInputFiles('input[type=file]', PHOTO2);
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === 'Use photo');
    return b && !b.disabled;
  }, null, { timeout: 15000 });
  await page.getByRole('button', { name: 'Use photo' }).click();
  await page.waitForTimeout(800);
  results.secondPhoto = await canvasAnalysis(page, '#your-pass canvas');
  fs.writeFileSync(path.join(SHOTS, 'test-second-photo.png'), await canvasPng(page, '#your-pass canvas'));

  // Share buttons present
  for (const label of [
    'DOWNLOAD MY PASS',
    'Share My Pass',
    'Share on LinkedIn',
    'Share on WhatsApp',
    'Share on Instagram',
    'Copy event announcement',
    'Download Pass Again',
    'Regenerate Pass',
    'Change Photo',
    'Edit Details',
    'Create Another Pass',
  ]) {
    results['button_' + label] = await page.getByRole('button', { name: label, exact: false }).count();
  }

  await page.screenshot({ path: path.join(SHOTS, 'test-desktop-result.png'), fullPage: false });

  // ---------------- MOBILE ----------------
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  mobile.on('console', (m) => m.type() === 'error' && errors.push('MOBILE: ' + m.text()));
  mobile.on('pageerror', (e) => errors.push('MOBILE PAGEERROR: ' + e.message));
  await mobile.goto(BASE, { waitUntil: 'networkidle' });
  await waitForCanvas(mobile, '#creator canvas');
  await fillAndUpload(mobile, { name: 'Ananya Iyer', college: 'IIT Madras', photo: PHOTO1 });
  await mobile.getByRole('button', { name: 'GENERATE MY PASS' }).click();
  await mobile.waitForSelector('#your-pass');
  await mobile.waitForTimeout(700);
  results.mobileHScroll = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  results.mobileResult = await canvasAnalysis(mobile, '#your-pass canvas');
  await mobile.locator('#your-pass').scrollIntoViewIfNeeded();
  await mobile.screenshot({ path: path.join(SHOTS, 'test-mobile-result.png'), fullPage: false });

  const [mDownload] = await Promise.all([
    mobile.waitForEvent('download', { timeout: 15000 }),
    mobile.getByRole('button', { name: 'DOWNLOAD MY PASS' }).click(),
  ]);
  const mPath = path.join(SHOTS, 'test-mobile-download.png');
  await mDownload.saveAs(mPath);
  results.mobileDownloadSize = fs.statSync(mPath).size;
  results.mobileDownloadName = mDownload.suggestedFilename();

  results.consoleErrors = errors;
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch((e) => {
  console.error('TEST FAILED:', e);
  process.exit(1);
});
