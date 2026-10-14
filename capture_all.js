import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\1d5c34c1-3dbd-4929-8f22-3c66b0d52ccd';
const BASE_URL = 'http://127.0.0.1:5173';

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const SEED_SEEKER = {
  id: 'usr_seeker_001',
  name: 'Ananya Sharma',
  email: 'seeker@demo.com',
  phone: '+91 98765 43210',
  role: 'seeker',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  city: 'Bengaluru, Karnataka',
  bio: 'Founder at a healthtech startup looking for verified specialist engineers and technical problem solvers.',
  createdAt: '2024-01-15T09:00:00Z',
  seekerDetails: {
    totalSpent: 18500,
    postedProblemsCount: 5,
    inProgressCount: 2,
    resolvedCount: 3,
    upcomingSessionsCount: 2,
  },
};

const SEED_SOLVER = {
  id: 'usr_solver_001',
  name: 'Dr. Rajesh Raman',
  email: 'solver@demo.com',
  phone: '+91 98450 12345',
  role: 'solver',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  city: 'Bengaluru, Karnataka',
  bio: 'Senior Distributed Systems Architect & WebRTC specialist with 8+ years optimizing cloud architecture, database query throughput, and Capacitor Android applications.',
  createdAt: '2023-11-20T14:30:00Z',
  solverDetails: {
    highestQualification: "Master's",
    fieldOfStudy: 'Computer Science & Distributed Systems',
    institution: 'IIT Madras',
    completionYear: '2016',
    experienceYears: 8,
    skills: ['React & TypeScript', 'Capacitor & Android', 'PostgreSQL Optimization', 'WebRTC & Audio/Video'],
    certifications: [],
    documents: [],
    verified: true,
    rating: 4.96,
    completedJobsCount: 42,
    activeJobsCount: 2,
    totalEarnings: 184500,
    hourlyRate: 1500,
  },
};

async function run() {
  console.log('Launching browser with camera/mic permissions...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--hide-scrollbars',
    ],
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(BASE_URL, ['camera', 'microphone']);

  const page = await browser.newPage();

  async function snap(filename, width = 1440, height = 900) {
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await new Promise((r) => setTimeout(r, 900));
    const targetPath = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: false });
    console.log(`[Captured] ${filename} (${width}x${height}) - URL: ${page.url()}`);
  }

  try {
    // Navigate first to set origin localStorage
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

    // Set Seeker in localStorage
    console.log('Setting Seeker credentials in localStorage...');
    await page.evaluate((u) => {
      localStorage.setItem('sb_current_user', JSON.stringify(u));
      localStorage.setItem('sb_auth_token', 'mock_jwt_token_12345');
    }, SEED_SEEKER);

    // Screen 1: Post Problem Form
    console.log('1. Post Problem Form');
    await page.goto(`${BASE_URL}/app/seeker/post`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await snap('post_problem_desktop.png', 1440, 900);
    await snap('post_problem_mobile.png', 390, 844);

    // Screen 3: Seeker Problem Details -> Offers Tab
    console.log('3. Seeker Offers Tab');
    await page.goto(`${BASE_URL}/app/seeker/problems`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const offerBtn = buttons.find((b) => b.textContent && b.textContent.includes('Offers'));
      if (offerBtn) {
        offerBtn.click();
      } else {
        const anyBtn = buttons.find((b) => b.textContent && b.textContent.includes('Inspect'));
        if (anyBtn) anyBtn.click();
      }
    });
    await new Promise((r) => setTimeout(r, 1000));
    // Also make sure Offers tab inside modal is selected
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const offerTab = tabs.find((t) => t.textContent && t.textContent.trim().startsWith('Offers'));
      if (offerTab) offerTab.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await snap('seeker_offers_tab_desktop.png', 1440, 900);
    await snap('seeker_offers_tab_mobile.png', 390, 844);

    // Screen 4: Checkout in ₹
    console.log('4. Checkout Screen in ₹');
    await page.goto(`${BASE_URL}/app/checkout/off_001/slot_101`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await snap('checkout_desktop.png', 1440, 900);
    await snap('checkout_mobile.png', 390, 844);

    // Screen 5: Sessions List
    console.log('5. Sessions List');
    await page.goto(`${BASE_URL}/app/sessions`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await snap('sessions_list_desktop.png', 1440, 900);
    await snap('sessions_list_mobile.png', 390, 844);

    // Screen 6: Pre-join Lobby
    console.log('6. Pre-Join Lobby');
    await page.goto(`${BASE_URL}/app/sessions/sess_live_01/lobby`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    await snap('prejoin_lobby_desktop.png', 1440, 900);
    await snap('prejoin_lobby_mobile.png', 390, 844);

    // Screen 7: Live Room - Video
    console.log('7. Live Room Video');
    await page.goto(`${BASE_URL}/app/sessions/sess_live_01/room`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2000));
    await snap('live_room_video_desktop.png', 1440, 900);
    await snap('live_room_video_mobile.png', 390, 844);

    // Screen 8: Live Room - Audio-only
    console.log('8. Live Room Audio-only');
    await page.goto(`${BASE_URL}/app/sessions/sess_live_audio/room`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2000));
    await snap('live_room_audio_desktop.png', 1440, 900);
    await snap('live_room_audio_mobile.png', 390, 844);

    // Screen 9: Live Room - Chat-only
    console.log('9. Live Room Chat-only');
    await page.goto(`${BASE_URL}/app/sessions/sess_live_chat/room`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2000));
    await snap('live_room_chat_desktop.png', 1440, 900);
    await snap('live_room_chat_mobile.png', 390, 844);

    // Screen 10: End-Session Rating Screen
    console.log('10. End-Session Rating Screen');
    await page.goto(`${BASE_URL}/app/sessions/sess_live_01/room`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const endBtn = buttons.find((b) => b.textContent && b.textContent.includes('End Call'));
      if (endBtn) endBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await snap('end_session_rating_desktop.png', 1440, 900);
    await snap('end_session_rating_mobile.png', 390, 844);

    // Switch to Solver
    console.log('--- Switching to Solver in localStorage ---');
    await page.evaluate((u) => {
      localStorage.setItem('sb_current_user', JSON.stringify(u));
      localStorage.setItem('sb_auth_token', 'mock_jwt_token_12345');
    }, SEED_SOLVER);

    // Screen 2: Solver Offer Appointment Modal
    console.log('2. Solver Offer Appointment Modal');
    await page.goto(`${BASE_URL}/app/solver/browse`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const offerBtn = buttons.find((b) => b.textContent && b.textContent.includes('Offer Appointment'));
      if (offerBtn) offerBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));
    await snap('solver_offer_modal_desktop.png', 1440, 900);
    await snap('solver_offer_modal_mobile.png', 390, 844);

    // Screen 11: Solver Availability Page
    console.log('11. Solver Availability Page');
    await page.goto(`${BASE_URL}/app/solver/availability`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await snap('solver_availability_desktop.png', 1440, 900);
    await snap('solver_availability_mobile.png', 390, 844);

    // Screen 12: Solver Earnings Page
    console.log('12. Solver Earnings Page');
    await page.goto(`${BASE_URL}/app/solver/earnings`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const withdrawBtn = buttons.find((b) => b.textContent && b.textContent.includes('Withdraw Funds'));
      if (withdrawBtn) withdrawBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await snap('solver_earnings_desktop.png', 1440, 900);
    await snap('solver_earnings_mobile.png', 390, 844);

    console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
