import fs from 'fs';
import { LATEST_BLOGS } from '../client/src/data/mockData.js';

const posts = JSON.parse(fs.readFileSync('./client/src/data/posts.json', 'utf-8'));

console.log('Total LATEST_BLOGS in mockData:', LATEST_BLOGS.length);
LATEST_BLOGS.forEach((blog, idx) => {
  const match = posts.find(p => p.slug === blog.slug);
  console.log(`[${idx + 1}] Card Title: "${blog.title}"`);
  console.log(`    Slug: ${blog.slug}`);
  console.log(`    Matched Post in posts.json: ${match ? `"${match.title}" (${match.content?.length} chars)` : 'MISSING'}`);
});
