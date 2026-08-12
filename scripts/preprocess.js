import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const possiblePaths = [
  path.join(rootDir, 'Wordpress data.txt'),
  path.join(rootDir, 'Wordpress_data.txt'),
  path.join(rootDir, 'client', 'Wordpress_data.txt'),
  path.join(rootDir, 'client', 'Wordpress data.txt')
];

let sourcePath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    sourcePath = p;
    break;
  }
}

if (!sourcePath) {
  console.error('CRITICAL ERROR: Wordpress_data.txt or Wordpress data.txt not found!');
  process.exit(1);
}

console.log(`Found WordPress export at: ${sourcePath}`);

const rawData = fs.readFileSync(sourcePath, 'utf8');
let data;
try {
  data = JSON.parse(rawData);
} catch (err) {
  console.error('CRITICAL ERROR: Failed to parse JSON:', err.message);
  process.exit(1);
}

if (!data || !data.rss || !data.rss.channel || !data.rss.channel.item) {
  console.error('CRITICAL ERROR: Invalid structure in WordPress JSON (missing rss.channel.item)');
  process.exit(1);
}

// 1. Resolve Author Map
const rawAuthors = data.rss.channel['wp:author'];
const authorMap = {};
if (rawAuthors) {
  const authorArray = Array.isArray(rawAuthors) ? rawAuthors : [rawAuthors];
  authorArray.forEach(a => {
    if (a && a['wp:author_login']) {
      const login = a['wp:author_login'];
      const displayName = a['wp:author_display_name'] || 
        [a['wp:author_first_name'], a['wp:author_last_name']].filter(Boolean).join(' ') || 
        login;
      authorMap[login] = displayName;
    }
  });
}

// 2. Filter published posts
const allItems = data.rss.channel.item;
const publishedPosts = allItems.filter(
  item => item['wp:post_type'] === 'post' && item['wp:status'] === 'publish'
);

console.log(`Filter results: ${publishedPosts.length} published posts out of ${allItems.length} total WXR items.`);

if (publishedPosts.length !== 192) {
  console.warn(`WARNING: Expected exactly 192 published posts, but found ${publishedPosts.length}.`);
}

// Entity & HTML utilities
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ');
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanHtml(html) {
  if (!html) return '';
  // Strip Gutenberg comments e.g. <!-- wp:paragraph -->
  let cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
  return cleaned.trim();
}

function generateExcerpt(excerptEncoded, contentEncoded) {
  let text = '';
  if (excerptEncoded && typeof excerptEncoded === 'string' && excerptEncoded.trim()) {
    text = stripHtml(excerptEncoded);
  }
  if (!text && contentEncoded) {
    text = stripHtml(cleanHtml(contentEncoded));
  }
  text = decodeEntities(text);
  if (text.length > 160) {
    let truncated = text.slice(0, 160);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 120) {
      truncated = truncated.slice(0, lastSpace);
    }
    return truncated + '...';
  }
  return text;
}

const allCategoriesMap = new Map();

const postsData = publishedPosts.map((item, index) => {
  const title = decodeEntities(typeof item.title === 'string' ? item.title : '');
  const slug = item['wp:post_name'] || `post-${index}`;
  const dateStr = item.pubDate || item['wp:post_date'] || '';
  const dateFormatted = formatDate(dateStr);
  
  const creatorLogin = item['dc:creator'] || '';
  const authorName = authorMap[creatorLogin] || creatorLogin || 'CS Prashant Kumar';

  // Category parsing: filter domain === 'category' only
  const categories = [];
  let rawCats = item.category;
  if (rawCats) {
    if (!Array.isArray(rawCats)) rawCats = [rawCats];
    rawCats.forEach(c => {
      if (c && c['@attributes'] && c['@attributes'].domain === 'category') {
        const catName = decodeEntities(c['#text'] || '').trim();
        const catSlug = (c['@attributes'].nicename || '').trim();
        if (catName && catSlug) {
          categories.push({ name: catName, slug: catSlug });
          allCategoriesMap.set(catSlug, catName);
        }
      }
    });
  }

  const rawContent = item['content:encoded'] || '';
  const cleanedContent = cleanHtml(rawContent);
  const excerpt = generateExcerpt(item['excerpt:encoded'], rawContent);

  return {
    id: item['wp:post_id'] || slug,
    title,
    slug,
    date: dateFormatted,
    rawDate: dateStr,
    author: authorName,
    authorLogin: creatorLogin,
    categories,
    excerpt,
    content: cleanedContent
  };
});

const postsSummaryData = postsData.map(({ content, ...summary }) => summary);

// Create target directory
const targetDir = path.join(rootDir, 'client', 'src', 'data');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Save posts.json
const postsFilePath = path.join(targetDir, 'posts.json');
fs.writeFileSync(postsFilePath, JSON.stringify(postsData, null, 2), 'utf8');

// Save posts-summary.json
const summaryFilePath = path.join(targetDir, 'posts-summary.json');
fs.writeFileSync(summaryFilePath, JSON.stringify(postsSummaryData, null, 2), 'utf8');

// Save categories.json
const categoriesList = Array.from(allCategoriesMap.entries()).map(([slug, name]) => ({ slug, name }));
const categoriesFilePath = path.join(targetDir, 'categories.json');
fs.writeFileSync(categoriesFilePath, JSON.stringify(categoriesList, null, 2), 'utf8');

console.log(`Successfully generated:`);
console.log(`- ${postsFilePath} (${postsData.length} posts, ${(fs.statSync(postsFilePath).size / 1024).toFixed(1)} KB)`);
console.log(`- ${summaryFilePath} (${postsSummaryData.length} post summaries, ${(fs.statSync(summaryFilePath).size / 1024).toFixed(1)} KB)`);
console.log(`- ${categoriesFilePath} (${categoriesList.length} distinct categories)`);
