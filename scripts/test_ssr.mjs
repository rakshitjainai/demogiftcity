process.env.NODE_ENV = 'test';
import app from '../server/index.js';

const server = app.listen(5099, async () => {
  try {
    const res = await fetch('http://localhost:5099/free-resources/blogs/retail-fme-gift-ifsc-setup', {
      headers: { 'User-Agent': 'facebookexternalhit/1.1' }
    });
    const html = await res.text();
    console.log('=== RAW HTML RETURNED BY SERVER ===');
    console.log(html.slice(0, 1800));
    console.log('\n=== MATCHED OG/TWITTER TAGS IN RAW HTML ===');
    const matches = html.match(/<(meta|link|title)[^>]*?>/gi);
    if (matches) {
      matches.filter(m => /og:|twitter:|description|canonical|title/i.test(m)).forEach(m => console.log(m));
    }
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
