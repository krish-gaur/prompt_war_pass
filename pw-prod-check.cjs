const { chromium } = require('playwright-core');
const fs = require('fs');
const crypto = require('crypto');

const BASE = 'http://localhost:4173';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = 'C:\\Users\\GALAXY ENTERPRISES\\Downloads\\workspace-01a217eb-41f9-713d-88a9-d912168e7f9b';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('#fullName', 'Aarav Sharma');
  await page.fill('#college', 'IIT Delhi');
  await page.setInputFiles('input[type=file]', ROOT + '\\test-photo.jpg');
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === 'Use photo');
    return b && !b.disabled;
  });
  await page.getByRole('button', { name: 'Use photo' }).click();
  await page.waitForFunction(() => document.body.innerText.includes('Photo ready'));
  await page.waitForTimeout(900);
  const dataUrl = await page.evaluate(() => document.querySelector('#creator canvas').toDataURL('image/png'));
  const preview = Buffer.from(dataUrl.split(',')[1], 'base64');
  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'GENERATE MY PASS' }).click().then(() =>
      page.waitForSelector('#your-pass').then(() => page.getByRole('button', { name: 'DOWNLOAD MY PASS' }).click()),
    ),
  ]);
  const p = ROOT + '\\shots\\prod-download.png';
  await dl.saveAs(p);
  const downloaded = fs.readFileSync(p);
  const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
  console.log(JSON.stringify({
    previewBytes: preview.length,
    downloadBytes: downloaded.length,
    identical: sha(preview) === sha(downloaded),
    name: dl.suggestedFilename(),
    errors,
  }, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
