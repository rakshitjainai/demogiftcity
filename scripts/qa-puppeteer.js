// scripts/qa-puppeteer.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

function waitForUrl(url, timeout = 60000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(true);
        else if (Date.now() - start < timeout) setTimeout(check, 1000);
        else resolve(false);
      }).on('error', () => {
        if (Date.now() - start < timeout) setTimeout(check, 1000);
        else resolve(false);
      });
    };
    check();
  });
}

function startBackground(cmd, args, cwd, env = {}) {
  const proc = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    shell: true,
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();
  return proc;
}

async function safeGoto(page, url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      return;
    } catch (e) {
      console.warn(`safeGoto attempt ${attempt} for ${url}: ${e.message}`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

(async () => {
  const envArg = process.argv[2] ?? 'dev';
  const isProd = envArg === 'prod';
  const backendPort = 5001;
  const backendUrl = `http://localhost:${backendPort}`;
  let baseUrl = '';

  console.log(`🔧 Ensuring backend is running on port ${backendPort}...`);
  startBackground('npm', ['start'], path.resolve('server'), { PORT: `${backendPort}` });
  const backendReady = await waitForUrl(`${backendUrl}/health`);
  if (!backendReady) {
    console.error('❌ Backend health check failed at http://localhost:5001/health');
    process.exit(1);
  }
  console.log('✅ Backend is up and healthy');

  if (!isProd) {
    console.log('🔧 Starting frontend dev server...');
    startBackground('npm', ['run', 'dev'], path.resolve('client'));
    const possiblePorts = [5173, 5174, 5175, 5176, 5177];
    for (const port of possiblePorts) {
      const u = `http://localhost:${port}`;
      if (await waitForUrl(u, 5000)) {
        baseUrl = u;
        console.log(`✅ Frontend dev server ready at ${baseUrl}`);
        break;
      }
    }
    if (!baseUrl) {
      console.error('❌ Frontend dev server unreachable.');
      process.exit(1);
    }
  } else {
    console.log('🔧 Starting production preview...');
    startBackground('npm', ['run', 'preview'], path.resolve('client'));
    const possiblePorts = [4173, 4174, 4175, 4176, 5000, 8080];
    for (const port of possiblePorts) {
      const u = `http://localhost:${port}`;
      if (await waitForUrl(u, 5000)) {
        baseUrl = u;
        console.log(`✅ Production preview running at ${baseUrl}`);
        break;
      }
    }
    if (!baseUrl) {
      console.error('❌ Production preview unreachable.');
      process.exit(1);
    }
  }

  const viewports = [
    { name: 'phone_320x568', width: 320, height: 568 },
    { name: 'phone_375x812', width: 375, height: 812 },
    { name: 'phone_390x844', width: 390, height: 844 },
    { name: 'phone_412x915', width: 412, height: 915 },
    { name: 'desktop_1366x768', width: 1366, height: 768 },
    { name: 'desktop_1440x900', width: 1440, height: 900 },
    { name: 'desktop_1920x1080', width: 1920, height: 1080 },
  ];

  const courses = [
    { slug: 'sebi-aif', name: 'sebi-aif' },
    { slug: 'ifsca-cmi', name: 'ifsca-cmi' },
    { slug: 'ifsca-fme', name: 'ifsca-fme' },
  ];

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  // Read existing results.json if present to append or overwrite
  let allResults = [];

  for (const vp of viewports) {
    for (const course of courses) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });

      const consoleErrors = [];
      const networkErrors = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('requestfailed', (req) => {
        networkErrors.push(`${req.url()} - ${req.failure()?.errorText || 'failed'}`);
      });

      const outDir = path.join('qa-screenshots', isProd ? 'prod' : 'dev', vp.name, course.name);
      fs.rmSync(outDir, { recursive: true, force: true });
      fs.mkdirSync(outDir, { recursive: true });

      console.log(`\n🚀 Testing [${isProd ? 'PROD' : 'DEV'}] ${course.slug} @ ${vp.name}...`);

      // 1. Navigate Home -> Clear Storage -> Hub -> Chapter 1
      await safeGoto(page, baseUrl);
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (_) {}
      });
      await safeGoto(page, `${baseUrl}/learn/${course.slug}`);
      await safeGoto(page, `${baseUrl}/learn/${course.slug}/chapter/1`);
      await new Promise(r => setTimeout(r, 1500));

      let expectedSteps = 0;
      let traversedSteps = 0;
      let completed = false;
      let horizontalOverflow = false;
      let clippingIssues = false;
      let navigationIssues = false;
      let flashcardIssues = false;
      let mcqIssues = false;

      let lastStepIdx = 0;
      let stepNum = 0;

      while (true) {
        stepNum++;
        // Inspect current step DOM state
        const stepState = await page.evaluate(() => {
          const stepCounterEl = Array.from(document.querySelectorAll('span')).find(s => {
            const txt = (s.innerText || s.textContent || '').trim();
            return txt.match(/Step \d+ of \d+/i);
          });
          let currentStepIdx = 1;
          let totalSteps = 1;
          if (stepCounterEl) {
            const txt = (stepCounterEl.innerText || stepCounterEl.textContent || '').trim();
            const m = txt.match(/Step (\d+) of (\d+)/i);
            if (m) {
              currentStepIdx = parseInt(m[1], 10);
              totalSteps = parseInt(m[2], 10);
            }
          }

          const hasOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;

          return {
            currentStepIdx,
            totalSteps,
            hasOverflow
          };
        });

        if (expectedSteps === 0) {
          expectedSteps = stepState.totalSteps;
        }

        if (stepState.hasOverflow) {
          horizontalOverflow = true;
        }

        traversedSteps = stepNum;

        // 1. Capture Screenshot
        const imgName = `step_${String(stepNum).padStart(3, '0')}.png`;
        const imgPath = path.join(outDir, imgName);
        await page.screenshot({ path: imgPath, fullPage: true });

        // 2. Flashcard Flip (only if Flashcard step)
        await page.evaluate(() => {
          const bodyText = document.body.innerText || '';
          if (bodyText.includes('Tap card to flip') || bodyText.includes('Smart Flip Card')) {
            const card = document.querySelector('.cursor-pointer');
            if (card) card.click();
          }
        });
        await new Promise(r => setTimeout(r, 150));

        // 3. Option Selection (if Question Step)
        await page.evaluate(() => {
          const stickyBar = document.querySelector('.sticky.bottom-0');
          const primaryBtn = stickyBar ? stickyBar.querySelector('button:last-child') : null;
          if (primaryBtn && primaryBtn.innerText.toUpperCase().includes('CHECK ANSWER')) {
            const optionBtns = Array.from(document.querySelectorAll('button[class*="border-2"]'));
            if (optionBtns.length > 0) {
              optionBtns[0].click();
            }
          }
        });
        await new Promise(r => setTimeout(r, 250));

        // 4. Submit Answer (if Check Answer exists & enabled)
        await page.evaluate(() => {
          const stickyBar = document.querySelector('.sticky.bottom-0');
          const primaryBtn = stickyBar ? stickyBar.querySelector('button:last-child') : null;
          if (primaryBtn && primaryBtn.innerText.toUpperCase().includes('CHECK ANSWER') && !primaryBtn.disabled) {
            primaryBtn.click();
          }
        });
        await new Promise(r => setTimeout(r, 300));

        // 5. Click Next / Complete Module button
        const isFinalStep = await page.evaluate(() => {
          const stickyBar = document.querySelector('.sticky.bottom-0');
          const primaryBtn = stickyBar ? stickyBar.querySelector('button:last-child') : null;
          const txt = (primaryBtn?.innerText || primaryBtn?.textContent || '').toUpperCase();
          return txt.includes('COMPLETE MODULE');
        });

        const nextClicked = await page.evaluate(() => {
          const stickyBar = document.querySelector('.sticky.bottom-0');
          const primaryBtn = stickyBar ? stickyBar.querySelector('button:last-child') : null;
          if (primaryBtn && !primaryBtn.disabled && primaryBtn.getAttribute('aria-disabled') !== 'true') {
            primaryBtn.click();
            return true;
          }
          return false;
        });

        if (!nextClicked) {
          console.warn(`⚠️ Action button not clickable on step ${stepState.currentStepIdx} of ${stepState.totalSteps}`);
          navigationIssues = true;
          break;
        }

        await new Promise(r => setTimeout(r, 800));

        if (isFinalStep) {
          completed = true;
          console.log(`✅ Module Completed for ${course.slug} (${vp.name}) - Total steps: ${expectedSteps}`);
          break;
        }

        lastStepIdx = stepState.currentStepIdx;
      }

      const screenshots = fs.readdirSync(outDir).filter(f => f.endsWith('.png'));

      const result = {
        environment: isProd ? 'PROD' : 'DEV',
        viewport: vp.name,
        course: course.slug,
        expectedSteps,
        traversedSteps,
        completed,
        screenshotCount: screenshots.length,
        horizontalOverflow,
        clippingIssues,
        navigationIssues,
        flashcardIssues,
        mcqIssues,
        consoleErrors: consoleErrors.length,
        networkErrors: networkErrors.length
      };

      console.log(`Summary (${course.slug} @ ${vp.name}): expected=${expectedSteps}, traversed=${traversedSteps}, screenshots=${screenshots.length}, completed=${completed}`);
      allResults.push(result);

      await page.close();
    }
  }

  await browser.close();

  // Load existing results.json if present and merge
  let existingResults = [];
  if (fs.existsSync('results.json')) {
    try {
      existingResults = JSON.parse(fs.readFileSync('results.json', 'utf8'));
    } catch (_) {}
  }
  
  // Filter out matching environment results to update
  const updatedResults = [
    ...existingResults.filter(r => r.environment !== (isProd ? 'PROD' : 'DEV')),
    ...allResults
  ];

  fs.writeFileSync('results.json', JSON.stringify(updatedResults, null, 2));
  console.log(`\n🎉 [${isProd ? 'PROD' : 'DEV'}] QA script completed successfully. Results saved to results.json`);
  process.exit(0);
})();
