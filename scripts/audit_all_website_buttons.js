process.env.NODE_ENV = 'test';
import app from '../server/index.js';
import puppeteer from '../client/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_TO_AUDIT = [
  '/',
  '/learn',
  '/understand',
  '/practice',
  '/practice/quizzes',
  '/practice/mock-tests',
  '/tools',
  '/tools/compliance-calendar',
  '/tools/regready-assessment',
  '/prepare',
  '/prepare/fme',
  '/regintel',
  '/free-resources',
  '/free-resources/blogs',
  '/free-resources/blogs/retail-fme-gift-ifsc-setup',
  '/free-resources/templates',
  '/about',
  '/membership'
];

const VIEWPORTS = [
  { name: 'Desktop (1280x800)', width: 1280, height: 800, isMobile: false },
  { name: 'Mobile / Phone (375x667)', width: 375, height: 667, isMobile: true }
];

async function runButtonAudit() {
  const server = app.listen(5094);
  let browser;
  const auditReport = {
    timestamp: new Date().toISOString(),
    totalPageAudits: 0,
    totalButtonsAudited: 0,
    deadButtonsFound: [],
    consoleErrorsFound: [],
    smallTouchTargetsFound: [],
    pageResults: []
  };

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const vp of VIEWPORTS) {
      for (const route of ROUTES_TO_AUDIT) {
        const page = await browser.newPage();
        await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });

        const pageErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            const text = msg.text();
            if (!text.includes('Failed to load resource') && !text.includes('favicon')) {
              pageErrors.push(text);
              auditReport.consoleErrorsFound.push({ route, viewport: vp.name, error: text });
            }
          }
        });

        page.on('pageerror', err => {
          pageErrors.push(err.message);
          auditReport.consoleErrorsFound.push({ route, viewport: vp.name, error: err.message });
        });

        const targetUrl = `http://localhost:5094${route}`;
        try {
          await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 15000 });
        } catch (gotoErr) {
          // Ignore timeout
        }

        const buttonsAudit = await page.evaluate((isMobile) => {
          const results = {
            totalButtons: 0,
            validButtons: 0,
            deadButtons: [],
            smallTouchTargets: []
          };

          const candidates = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]'));

          candidates.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden';
            
            if (!isVisible) return;

            results.totalButtons++;
            const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || el.value || el.tagName).trim().slice(0, 50);
            const href = el.getAttribute('href');
            const tagName = el.tagName.toLowerCase();

            if (isMobile && (rect.width < 32 || rect.height < 32)) {
              results.smallTouchTargets.push({
                text,
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              });
            }

            let isDead = false;
            let deadReason = '';

            if (tagName === 'a') {
              if (!href || href === '#' || href === 'javascript:void(0)' || href === 'javascript:;') {
                const hasClickAttr = el.hasAttribute('onclick') || el.className.includes('cursor-pointer') || el.className.includes('btn') || el.getAttribute('role') === 'button';
                if (!hasClickAttr) {
                  isDead = true;
                  deadReason = 'Anchor link with empty/hash href and no click handler';
                }
              }
            } else if (tagName === 'button') {
              const type = el.getAttribute('type');
              if (type === 'submit') {
                const form = el.closest('form');
                if (!form) {
                  isDead = true;
                  deadReason = 'Button type="submit" outside of any <form>';
                }
              }
            }

            if (isDead) {
              results.deadButtons.push({
                text,
                tagName,
                reason: deadReason
              });
            } else {
              results.validButtons++;
            }
          });

          return results;
        }, vp.isMobile);

        auditReport.totalPageAudits++;
        auditReport.totalButtonsAudited += buttonsAudit.totalButtons;
        
        if (buttonsAudit.deadButtons.length > 0) {
          buttonsAudit.deadButtons.forEach(db => {
            auditReport.deadButtonsFound.push({ route, viewport: vp.name, ...db });
          });
        }

        if (buttonsAudit.smallTouchTargets.length > 0) {
          buttonsAudit.smallTouchTargets.forEach(st => {
            auditReport.smallTouchTargetsFound.push({ route, viewport: vp.name, ...st });
          });
        }

        auditReport.pageResults.push({
          route,
          viewport: vp.name,
          totalButtons: buttonsAudit.totalButtons,
          validButtons: buttonsAudit.validButtons,
          deadButtonsCount: buttonsAudit.deadButtons.length,
          errorsCount: pageErrors.length
        });

        await page.close();
      }
    }

    const reportPath = path.join(__dirname, '..', 'button_audit_results.json');
    fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
    console.log(`✅ Full JSON audit report saved to: ${reportPath}`);

  } catch (err) {
    console.error('Audit error:', err);
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(0);
  }
}

runButtonAudit();
