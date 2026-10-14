import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\62675646-6051-4180-993f-a6ea61bf4faf';
const BASE_URL = 'http://127.0.0.1:5173';

async function run() {
  console.log('Launching browser for dashboard capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });

  try {
    const page = await browser.newPage();

    async function snap(filename, width = 1280, height = 800) {
      await page.setViewport({ width, height, deviceScaleFactor: 2 });
      await new Promise((r) => setTimeout(r, 800));
      const targetPath = path.join(ARTIFACT_DIR, filename);
      await page.screenshot({ path: targetPath, fullPage: false });
      console.log(`Captured: ${filename}`);
    }

    // 10. Seeker Dashboard
    console.log('Logging in as Seeker...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    
    await page.type('input[name="emailOrPhone"]', 'seeker@demo.com');
    await page.type('input[name="password"]', 'Demo@123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForFunction(() => window.location.pathname.includes('/app/seeker'), { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 1200));

    console.log('Capturing Seeker Dashboard Desktop & Mobile...');
    await snap('seeker_dashboard_desktop.png', 1280, 800);
    await snap('seeker_dashboard_mobile.png', 390, 844);

    // 12. Solver Dashboard
    console.log('Logging out & logging in as Solver...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    
    // Click Solver role tab
    const tabs = await page.$$('button[role="tab"]');
    if (tabs.length > 1) {
      await tabs[1].click();
      await new Promise((r) => setTimeout(r, 300));
    }

    await page.type('input[name="emailOrPhone"]', 'solver@demo.com');
    await page.type('input[name="password"]', 'Demo@123');
    await page.click('button[type="submit"]');

    // Wait for solver dashboard
    await page.waitForFunction(() => window.location.pathname.includes('/app/solver'), { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 1200));

    console.log('Capturing Solver Dashboard Desktop & Mobile...');
    await snap('solver_dashboard_desktop.png', 1280, 800);
    await snap('solver_dashboard_mobile.png', 390, 844);

    console.log('Dashboard captures completed successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Error capturing dashboard:', err);
  process.exit(1);
});
