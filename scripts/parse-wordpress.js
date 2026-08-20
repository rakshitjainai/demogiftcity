import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseWordpress() {
  const filePath = path.join(__dirname, '..', 'Wordpress data.txt');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Wordpress data.txt not found at', filePath);
    return;
  }

  console.log('⏳ Reading Wordpress data.txt...');
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  const items = data.rss.channel.item || [];
  const posts = items.filter(item => item['wp:post_type'] === 'post');

  console.log(`✅ Found ${posts.length} posts. Reshaping to RegIntel model...`);

  const reshaped = posts.map((p, idx) => {
    // Extract categories
    const categories = [];
    if (p.category) {
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      cats.forEach(c => {
        if (c && c['#text']) categories.push(c['#text']);
        else if (typeof c === 'string') categories.push(c);
        else if (c && c['@attributes'] && c['@attributes'].nicename) {
          categories.push(c['@attributes'].nicename);
        }
      });
    }

    // Determine regulator
    let regulator = 'Others';
    const textToSearch = (p.title + ' ' + categories.join(' ')).toLowerCase();
    if (textToSearch.includes('ifsca') || textToSearch.includes('gift city') || textToSearch.includes('gift ifsc')) {
      regulator = 'IFSCA';
    } else if (textToSearch.includes('sebi') || textToSearch.includes('lodr') || textToSearch.includes('aif')) {
      regulator = 'SEBI';
    } else if (textToSearch.includes('mca') || textToSearch.includes('companies act') || textToSearch.includes('secretarial')) {
      regulator = 'MCA';
    } else if (textToSearch.includes('rbi') || textToSearch.includes('banking') || textToSearch.includes('pmla')) {
      regulator = 'RBI';
    } else if (textToSearch.includes('fema') || textToSearch.includes('overseas investment') || textToSearch.includes('odi')) {
      regulator = 'FEMA';
    } else if (textToSearch.includes('tax') || textToSearch.includes('gst') || textToSearch.includes('income tax')) {
      regulator = 'Tax';
    } else if (textToSearch.includes('irdai') || textToSearch.includes('insurance')) {
      regulator = 'IRDAI';
    }

    // Determine impact level
    let impact = 'Low Impact';
    if (textToSearch.includes('amendment') || textToSearch.includes('notification') || textToSearch.includes('order') || textToSearch.includes('circular')) {
      impact = 'Medium Impact';
    }
    if (textToSearch.includes('penalty') || textToSearch.includes('enforcement') || textToSearch.includes('cancellation') || textToSearch.includes('restriction') || textToSearch.includes('master circular')) {
      impact = 'High Impact';
    }

    // Content encoded
    const content = p['content:encoded'] || '';
    // Strip HTML to get a clean excerpt
    const cleanText = content.replace(/<\/?[^>]+(>|$)/g, '').trim();
    const excerpt = p['excerpt:encoded'] || (cleanText.substring(0, 180) + '...');

    return {
      id: `wp-${p['wp:post_id'] || idx}`,
      title: p.title || 'Untitled Update',
      link: p.link || '#',
      date: p.pubDate ? new Date(p.pubDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'August 2026',
      author: p['dc:creator'] || 'CS Prashant Kumar',
      category: categories[0] || 'Regulatory Update',
      categories,
      regulator,
      regulatorId: regulator.toLowerCase(),
      impact,
      desc: excerpt,
      content: content
    };
  });

  const outPath = path.join(__dirname, '..', 'server', 'data', 'wordpress-posts.json');
  fs.writeFileSync(outPath, JSON.stringify(reshaped, null, 2), 'utf8');
  console.log(`🎉 Successfully parsed & saved ${reshaped.length} posts to ${outPath}`);
}

parseWordpress();
