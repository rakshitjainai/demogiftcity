process.env.NODE_ENV = 'test';
import app from '../server/index.js';

const CRAWLERS = [
  { name: 'Facebook Crawler', ua: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' },
  { name: 'LinkedIn Crawler', ua: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient/4.5.13)' },
  { name: 'Twitter / X Crawler', ua: 'Twitterbot/1.0' },
  { name: 'WhatsApp Crawler', ua: 'WhatsApp/2.21.12.21 N' },
  { name: 'Slack Crawler', ua: 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)' }
];

const server = app.listen(5096, async () => {
  try {
    console.log('=== MULTI-CRAWLER SOCIAL METADATA AUDIT ===\n');
    for (const crawler of CRAWLERS) {
      const res = await fetch('http://localhost:5096/free-resources/blogs/retail-fme-gift-ifsc-setup', {
        headers: { 'User-Agent': crawler.ua }
      });
      const html = await res.text();
      const hasTitle = html.includes('Setting Up a Retail FME in GIFT IFSC: Process, Eligibility, Cost and Timeline');
      const hasOgImg = html.includes('https://www.regmate.in/images/blog/retail-fme-gift-ifsc-cover.jpg');
      const hasTwitterCard = html.includes('summary_large_image');
      const hasDesc = html.includes('A practical guide to setting up a Retail FME in GIFT IFSC');
      
      console.log(`[${crawler.name}]`);
      console.log(`  User-Agent: ${crawler.ua}`);
      console.log(`  HTTP Status: ${res.status}`);
      console.log(`  Title Tag Verified: ${hasTitle ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  Description Tag Verified: ${hasDesc ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  OG Image (1200x630) Verified: ${hasOgImg ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  Twitter Card Verified: ${hasTwitterCard ? '✅ PASS' : '❌ FAIL'}\n`);
    }
  } catch (err) {
    console.error('Crawler test failed:', err);
  } finally {
    server.close();
    setTimeout(() => process.exit(0), 100);
  }
});
