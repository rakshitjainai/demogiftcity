import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORTS = [
  { name: 'Mobile 320x844', width: 320, height: 844 },
  { name: 'Mobile 360x800', width: 360, height: 800 },
  { name: 'Mobile 375x812', width: 375, height: 812 },
  { name: 'Mobile 390x844', width: 390, height: 844 },
  { name: 'Mobile 412x915', width: 412, height: 915 },
  { name: 'Mobile 430x932', width: 430, height: 932 },
];

const DESKTOP_VIEWPORTS = [
  { name: 'Desktop 1024x768', width: 1024, height: 768 },
  { name: 'Desktop 1280x800', width: 1280, height: 800 },
  { name: 'Desktop 1440x900', width: 1440, height: 900 },
];

const ALL_VIEWPORTS = [...MOBILE_VIEWPORTS, ...DESKTOP_VIEWPORTS];

for (const vp of ALL_VIEWPORTS) {
  test.describe(`[${vp.name}] Canonical Blog Routing & Article Navigation`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('Homepage Latest Articles -> Card click -> Canonical slug route -> Title & Content match', async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('http://localhost:5173/');
      await page.waitForLoadState('networkidle');

      // Locate article cards under Latest Articles section
      const articleLinks = page.locator('a[href^="/free-resources/blogs/"]');
      const count = await articleLinks.count();
      expect(count).toBeGreaterThan(0);

      // Verify each visible article link uses canonical slug, not raw ID
      for (let i = 0; i < Math.min(count, 3); i++) {
        const link = articleLinks.nth(i);
        const href = await link.getAttribute('href');
        expect(href).not.toMatch(/\/free-resources\/blogs\/blog-\d+$/);
        expect(href).toMatch(/^\/free-resources\/blogs\/[a-z0-9-]+$/);
      }

      // Click first article
      const firstLink = articleLinks.first();
      const cardTitle = (await firstLink.locator('h4').textContent())?.trim();
      const expectedHref = await firstLink.getAttribute('href');

      await firstLink.click();
      await page.waitForLoadState('networkidle');

      // Verify URL
      expect(page.url()).toContain(expectedHref);

      // Verify Article Title matches
      const articleHeading = page.locator('h1').first();
      await expect(articleHeading).toBeVisible();
      const pageTitle = (await articleHeading.textContent())?.trim();
      expect(pageTitle.toLowerCase()).toContain(cardTitle.slice(0, 10).toLowerCase());

      // Verify Article Content is rendered and non-empty
      const bodyContent = page.locator('.blog-content-body');
      await expect(bodyContent).toBeVisible();
      const textLen = (await bodyContent.textContent())?.trim().length || 0;
      expect(textLen).toBeGreaterThan(10);

      // Ensure no uncaught console errors
      const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('404'));
      expect(criticalErrors.length).toBe(0);
    });

    test('Legacy route /free-resources/blogs/blog-1 redirects cleanly to canonical slug', async ({ page }) => {
      await page.goto('http://localhost:5173/free-resources/blogs/blog-1');
      await page.waitForLoadState('networkidle');

      // Should automatically redirect to canonical slug
      await expect(page).toHaveURL(/.*\/free-resources\/blogs\/esop-design-for-startups-india/);

      // Article should be loaded, not 404
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      const titleText = await heading.textContent();
      expect(titleText).toContain('ESOP Scheme');

      const body = page.locator('.blog-content-body');
      await expect(body).toBeVisible();
    });

    test('Prev/Next navigation, direct load, back/forward history', async ({ page }) => {
      await page.goto('http://localhost:5173/free-resources/blogs/esop-design-for-startups-india');
      await page.waitForLoadState('networkidle');

      const initialTitle = await page.locator('h1').first().textContent();

      // Test refresh
      await page.reload();
      await page.waitForLoadState('networkidle');
      expect(await page.locator('h1').first().textContent()).toBe(initialTitle);

      // Test Next/Prev if available
      const nextBtn = page.locator('footer a:has-text("Next Article")');
      if (await nextBtn.isVisible()) {
        const nextHref = await nextBtn.getAttribute('href');
        expect(nextHref).toMatch(/^\/free-resources\/blogs\/[a-z0-9-]+$/);
        expect(nextHref).not.toContain('blog-');

        await nextBtn.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain(nextHref);

        // Test browser back
        await page.goBack();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('esop-design-for-startups-india');

        // Test browser forward
        await page.goForward();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain(nextHref);
      }
    });
  });
}

